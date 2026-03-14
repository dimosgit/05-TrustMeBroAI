import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { hashSessionToken } from "../../src/utils/sessionToken.js";
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

async function createUnlockedUser(app, email) {
  const session = await request(app)
    .post("/api/recommendation/session")
    .send({
      profile_id: 1,
      task_id: 1,
      selected_priority: "Best quality",
      wizard_duration_seconds: 20
    })
    .expect(201);

  const compute = await request(app)
    .post("/api/recommendation/compute")
    .send({
      session_id: session.body.session_id
    })
    .expect(200);

  await request(app)
    .post("/api/recommendation/unlock")
    .send({
      session_id: session.body.session_id,
      recommendation_id: compute.body.recommendation_id,
      email,
      email_consent: true,
      signup_source: "wizard"
    })
    .expect(200);
}

async function registerPasskey(app, { email, credentialId = "cred-register-1" }) {
  const options = await request(app)
    .post("/api/auth/passkey/register/options")
    .send({
      email,
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(200);

  const challengeId = options.body.challenge_id;
  const challenge = options.body.public_key.challenge;

  const verify = await request(app)
    .post("/api/auth/passkey/register/verify")
    .send({
      challenge_id: challengeId,
      credential: buildRegistrationCredential({
        challenge,
        credentialId
      })
    })
    .expect(200);

  return {
    cookie: verify.headers["set-cookie"]?.[0] || null
  };
}

test("passkey register creates/upgrades user, stores passkey, and creates a session cookie", async () => {
  const { app, repositories } = createTestApp();

  const options = await request(app)
    .post("/api/auth/passkey/register/options")
    .send({
      email: "NewUser@example.com",
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(200);

  assert.ok(options.body.challenge_id);
  assert.ok(options.body.public_key?.challenge);

  const verify = await request(app)
    .post("/api/auth/passkey/register/verify")
    .send({
      challenge_id: options.body.challenge_id,
      credential: buildRegistrationCredential({
        challenge: options.body.public_key.challenge,
        credentialId: "cred-new-user"
      })
    })
    .expect(200);

  assert.ok(verify.headers["set-cookie"]);
  const cookie = verify.headers["set-cookie"][0];
  assert.ok(cookie.includes("tmb_session="));
  assert.equal(verify.body.user.email, "newuser@example.com");

  assert.equal(repositories.data.users.length, 1);
  assert.ok(repositories.data.users[0].registered_at);

  assert.equal(repositories.data.authPasskeys.length, 1);
  assert.equal(repositories.data.authPasskeys[0].credential_id, "cred-new-user");
  assert.equal(
    repositories.data.authPasskeys[0].public_key,
    Buffer.from("public-key:cred-new-user", "utf8").toString("base64url")
  );

  const me = await request(app).get("/api/auth/me").set("Cookie", cookie).expect(200);
  assert.equal(me.body.user.email, "newuser@example.com");
});

test("register upgrades an existing unlock-created user without duplicate account", async () => {
  const { app, repositories } = createTestApp();

  await createUnlockedUser(app, "existing@example.com");

  assert.equal(repositories.data.users.length, 1);
  assert.equal(repositories.data.users[0].registered_at, null);

  await registerPasskey(app, {
    email: "EXISTING@example.com",
    credentialId: "cred-existing"
  });

  assert.equal(repositories.data.users.length, 1);
  assert.ok(repositories.data.users[0].registered_at);
  assert.equal(repositories.data.authPasskeys.length, 1);
});

test("passkey login success updates credential counter and supports me/logout lifecycle", async () => {
  const { app, repositories } = createTestApp();

  await registerPasskey(app, {
    email: "signin@example.com",
    credentialId: "cred-signin"
  });

  const loginOptions = await request(app)
    .post("/api/auth/passkey/login/options")
    .send({ email: "signin@example.com" })
    .expect(200);

  const loginVerify = await request(app)
    .post("/api/auth/passkey/login/verify")
    .send({
      challenge_id: loginOptions.body.challenge_id,
      credential: buildAuthenticationCredential({
        challenge: loginOptions.body.public_key.challenge,
        credentialId: "cred-signin"
      })
    })
    .expect(200);

  assert.equal(loginVerify.body.user.email, "signin@example.com");
  const cookie = loginVerify.headers["set-cookie"]?.[0];
  assert.ok(cookie);

  const me = await request(app).get("/api/auth/me").set("Cookie", cookie).expect(200);
  assert.equal(me.body.user.email, "signin@example.com");

  const logout = await request(app).post("/api/auth/logout").set("Cookie", cookie).expect(204);
  assert.ok(logout.headers["set-cookie"]);

  await request(app).get("/api/auth/me").set("Cookie", cookie).expect(401);

  assert.equal(repositories.data.authPasskeys[0].counter, 1);
  assert.ok(repositories.data.users[0].last_login_at);
});

test("passkey login rejects invalid challenge and replayed challenge", async () => {
  const { app } = createTestApp();

  await registerPasskey(app, {
    email: "challenge@example.com",
    credentialId: "cred-challenge"
  });

  const loginOptions = await request(app)
    .post("/api/auth/passkey/login/options")
    .send({ email: "challenge@example.com" })
    .expect(200);

  await request(app)
    .post("/api/auth/passkey/login/verify")
    .send({
      challenge_id: loginOptions.body.challenge_id,
      credential: buildAuthenticationCredential({
        challenge: "wrong-challenge",
        credentialId: "cred-challenge"
      })
    })
    .expect(401);

  const validChallenge = await request(app)
    .post("/api/auth/passkey/login/options")
    .send({ email: "challenge@example.com" })
    .expect(200);

  await request(app)
    .post("/api/auth/passkey/login/verify")
    .send({
      challenge_id: validChallenge.body.challenge_id,
      credential: buildAuthenticationCredential({
        challenge: validChallenge.body.public_key.challenge,
        credentialId: "cred-challenge"
      })
    })
    .expect(200);

  await request(app)
    .post("/api/auth/passkey/login/verify")
    .send({
      challenge_id: validChallenge.body.challenge_id,
      credential: buildAuthenticationCredential({
        challenge: validChallenge.body.public_key.challenge,
        credentialId: "cred-challenge"
      })
    })
    .expect(401);
});

test("fallback recovery request + verify works and token is hashed + one-time use", async () => {
  const { app, repositories, authOutbox } = createTestApp();

  await createUnlockedUser(app, "recovery@example.com");

  const requestResponse = await request(app)
    .post("/api/auth/recovery/request")
    .send({
      email: "RECOVERY@example.com",
      redirect_path: "/wizard"
    })
    .expect(202);

  assert.equal(requestResponse.body.message, "If the email is valid, you will receive a recovery link.");
  assert.equal(authOutbox.length, 1);
  assert.equal(authOutbox[0].flow, "recovery");

  assert.equal(repositories.data.authRecoveryTokens.length, 1);
  assert.equal(
    repositories.data.authRecoveryTokens[0].token_hash,
    hashSessionToken(authOutbox[0].token)
  );
  assert.equal(repositories.data.authRecoveryTokens[0].token_hash === authOutbox[0].token, false);

  const verify = await request(app)
    .post("/api/auth/recovery/verify")
    .send({ token: authOutbox[0].token })
    .expect(200);

  assert.equal(verify.body.user.email, "recovery@example.com");
  assert.equal(verify.body.requires_passkey_enrollment, true);
  assert.ok(verify.headers["set-cookie"]);

  await request(app)
    .post("/api/auth/recovery/verify")
    .send({ token: authOutbox[0].token })
    .expect(401);

  const unknown = await request(app)
    .post("/api/auth/recovery/request")
    .send({ email: "unknown@example.com" })
    .expect(202);

  assert.equal(unknown.body.message, "If the email is valid, you will receive a recovery link.");
  assert.equal(authOutbox.length, 1);
});

test("recovery verify preserves requires_passkey_enrollment=false when passkey already exists", async () => {
  const { app, authOutbox } = createTestApp();

  await registerPasskey(app, {
    email: "recovery-passkey@example.com",
    credentialId: "cred-recovery-passkey"
  });

  await request(app)
    .post("/api/auth/recovery/request")
    .send({
      email: "recovery-passkey@example.com",
      redirect_path: "/history"
    })
    .expect(202);

  const recoveryToken = authOutbox.at(-1)?.token;
  assert.ok(recoveryToken);

  const verify = await request(app)
    .post("/api/auth/recovery/verify")
    .send({ token: recoveryToken })
    .expect(200);

  assert.equal(verify.body.user.email, "recovery-passkey@example.com");
  assert.equal(verify.body.requires_passkey_enrollment, false);
});

test("anonymous unlock still requires email when no authenticated session is present", async () => {
  const { app } = createTestApp();

  const session = await request(app)
    .post("/api/recommendation/session")
    .send({
      profile_id: 1,
      task_id: 1,
      selected_priority: "Best quality",
      wizard_duration_seconds: 20
    })
    .expect(201);

  const compute = await request(app)
    .post("/api/recommendation/compute")
    .send({ session_id: session.body.session_id })
    .expect(200);

  const response = await request(app)
    .post("/api/recommendation/unlock")
    .send({
      session_id: session.body.session_id,
      recommendation_id: compute.body.recommendation_id
    })
    .expect(400);

  assert.equal(response.body.message, "A valid email is required");
});

test("runtime provider adapter is invoked for recovery requests", async () => {
  const sentRecoveryLinks = [];
  const provider = {
    async sendMagicLink(payload) {
      sentRecoveryLinks.push(payload);
    }
  };

  const { app } = createTestApp({
    useRuntimeAuthService: true,
    magicLinkProvider: provider
  });

  await createUnlockedUser(app, "provider@example.com");

  await request(app)
    .post("/api/auth/recovery/request")
    .send({ email: "provider@example.com" })
    .expect(202);

  assert.equal(sentRecoveryLinks.length, 1);
  assert.equal(sentRecoveryLinks[0].flow, "recovery");
});

test("auth limiter returns 429 when threshold is exceeded", async () => {
  const { app } = createTestApp({
    authRateLimitMax: 1,
    authRateLimitWindowMs: 60_000
  });

  await request(app)
    .post("/api/auth/passkey/login/options")
    .send({ email: "ratelimit@example.com" })
    .expect(200);

  const blocked = await request(app)
    .post("/api/auth/passkey/login/options")
    .send({ email: "ratelimit@example.com" })
    .expect(429);

  assert.equal(blocked.body.message, "Too many auth requests");
  assert.ok(blocked.headers["retry-after"]);
});
