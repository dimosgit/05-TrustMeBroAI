import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createTestApp } from "../helpers/createTestApp.js";

function encodeClientDataJSON({ type, challenge, origin = "http://localhost:5174" }) {
  return Buffer.from(
    JSON.stringify({
      type,
      challenge,
      origin,
      crossOrigin: false
    }),
    "utf8"
  ).toString("base64url");
}

function buildRegistrationCredential({ challenge, credentialId }) {
  return {
    id: credentialId,
    type: "public-key",
    rawId: credentialId,
    response: {
      clientDataJSON: encodeClientDataJSON({
        type: "webauthn.create",
        challenge
      }),
      attestationObject: "test-attestation-object",
      transports: ["internal"]
    }
  };
}

function buildAuthenticationCredential({ challenge, credentialId }) {
  return {
    id: credentialId,
    type: "public-key",
    rawId: credentialId,
    response: {
      clientDataJSON: encodeClientDataJSON({
        type: "webauthn.get",
        challenge
      }),
      authenticatorData: "test-authenticator-data",
      signature: "test-signature",
      userHandle: null
    }
  };
}

async function registerPasskey(app, { email, credentialId }) {
  const options = await request(app)
    .post("/api/auth/passkey/register/options")
    .send({
      email,
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(200);

  const verify = await request(app)
    .post("/api/auth/passkey/register/verify")
    .send({
      challenge_id: options.body.challenge_id,
      credential: buildRegistrationCredential({
        challenge: options.body.public_key.challenge,
        credentialId
      })
    })
    .expect(200);

  return {
    cookie: verify.headers["set-cookie"]?.[0] || null
  };
}

async function loginWithPasskey(app, { email, credentialId }) {
  const options = await request(app)
    .post("/api/auth/passkey/login/options")
    .send({ email })
    .expect(200);

  const verify = await request(app)
    .post("/api/auth/passkey/login/verify")
    .send({
      challenge_id: options.body.challenge_id,
      credential: buildAuthenticationCredential({
        challenge: options.body.public_key.challenge,
        credentialId
      })
    })
    .expect(200);

  return {
    cookie: verify.headers["set-cookie"]?.[0] || null
  };
}

async function createSessionAndCompute(app) {
  const sessionResponse = await request(app)
    .post("/api/recommendation/session")
    .send({
      profile_id: 1,
      task_id: 1,
      selected_priority: "Best quality",
      wizard_duration_seconds: 12
    })
    .expect(201);

  const computeResponse = await request(app)
    .post("/api/recommendation/compute")
    .send({
      session_id: sessionResponse.body.session_id
    })
    .expect(200);

  return {
    sessionId: sessionResponse.body.session_id,
    recommendationId: computeResponse.body.recommendation_id
  };
}

test("history endpoint rejects unauthenticated access", async () => {
  const { app } = createTestApp();

  await request(app).get("/api/recommendation/history").expect(401);
});

test("authenticated history returns empty items when user has no unlocked recommendations", async () => {
  const { app } = createTestApp();

  const { cookie } = await registerPasskey(app, {
    email: "history-empty@example.com",
    credentialId: "cred-history-empty"
  });

  await createSessionAndCompute(app);

  const history = await request(app)
    .get("/api/recommendation/history")
    .set("Cookie", cookie)
    .expect(200);

  assert.deepEqual(history.body.items, []);
});

test("authenticated user can retrieve recommendation history in user scope", async () => {
  const { app } = createTestApp();

  const { cookie } = await registerPasskey(app, {
    email: "history@example.com",
    credentialId: "cred-history-user"
  });
  assert.ok(cookie);

  const first = await createSessionAndCompute(app);
  const firstUnlock = await request(app)
    .post("/api/recommendation/unlock")
    .set("Cookie", cookie)
    .send({
      session_id: first.sessionId,
      recommendation_id: first.recommendationId
    })
    .expect(200);
  assert.equal(firstUnlock.body.primary_tool.locked, false);

  const second = await createSessionAndCompute(app);
  const secondUnlock = await request(app)
    .post("/api/recommendation/unlock")
    .set("Cookie", cookie)
    .send({
      session_id: second.sessionId,
      recommendation_id: second.recommendationId
    })
    .expect(200);
  assert.equal(secondUnlock.body.primary_tool.locked, false);

  const history = await request(app)
    .get("/api/recommendation/history")
    .set("Cookie", cookie)
    .expect(200);

  assert.equal(Array.isArray(history.body.items), true);
  assert.equal(history.body.items.length, 2);
  assert.equal(history.body.items[0].recommendation_id, second.recommendationId);
  assert.equal(history.body.items[1].recommendation_id, first.recommendationId);
  assert.equal(history.body.items[0].primary_tool.tool_name.length > 0, true);
});

test("history detail endpoint enforces user isolation", async () => {
  const { app } = createTestApp();

  const userA = await registerPasskey(app, {
    email: "a@example.com",
    credentialId: "cred-a"
  });
  const userB = await registerPasskey(app, {
    email: "b@example.com",
    credentialId: "cred-b"
  });

  const recA = await createSessionAndCompute(app);
  await request(app)
    .post("/api/recommendation/unlock")
    .set("Cookie", userA.cookie)
    .send({
      session_id: recA.sessionId,
      recommendation_id: recA.recommendationId
    })
    .expect(200);

  const recB = await createSessionAndCompute(app);
  await request(app)
    .post("/api/recommendation/unlock")
    .set("Cookie", userB.cookie)
    .send({
      session_id: recB.sessionId,
      recommendation_id: recB.recommendationId
    })
    .expect(200);

  const own = await request(app)
    .get(`/api/recommendation/history/${recA.recommendationId}`)
    .set("Cookie", userA.cookie)
    .expect(200);

  assert.equal(own.body.recommendation_id, recA.recommendationId);
  assert.equal(Array.isArray(own.body.alternative_tools), true);

  await request(app)
    .get(`/api/recommendation/history/${recB.recommendationId}`)
    .set("Cookie", userA.cookie)
    .expect(404);
});

test("funnel metrics are persisted for account/sign-in/unlock/try-it flow", async () => {
  const { app, repositories } = createTestApp();

  await registerPasskey(app, {
    email: "metrics@example.com",
    credentialId: "cred-metrics"
  });

  const login = await loginWithPasskey(app, {
    email: "metrics@example.com",
    credentialId: "cred-metrics"
  });

  const recommendation = await createSessionAndCompute(app);
  await request(app)
    .post("/api/recommendation/unlock")
    .set("Cookie", login.cookie)
    .send({
      session_id: recommendation.sessionId,
      recommendation_id: recommendation.recommendationId
    })
    .expect(200);

  await request(app)
    .post(`/api/recommendation/${recommendation.recommendationId}/try-it-click`)
    .send({
      session_id: recommendation.sessionId
    })
    .expect(201);

  const eventNames = repositories.data.funnelEvents.map((event) => event.event_name);
  assert.ok(eventNames.includes("account_created"));
  assert.ok(eventNames.includes("sign_in_completed"));
  assert.ok(eventNames.includes("recommendation_unlocked"));
  assert.ok(eventNames.includes("try_it_clicked"));
});

test("anonymous recommendation flow still works without auth", async () => {
  const { app } = createTestApp();

  const recommendation = await createSessionAndCompute(app);
  const result = await request(app)
    .post("/api/recommendation/compute")
    .send({
      session_id: recommendation.sessionId
    })
    .expect(200);

  assert.equal(result.body.primary_tool.locked, true);
  assert.equal(Array.isArray(result.body.alternative_tools), true);
});
