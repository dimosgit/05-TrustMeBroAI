import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { hashSessionToken } from "../../src/utils/sessionToken.js";
import { createTestApp } from "../helpers/createTestApp.js";

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

test("register creates a user, persists registration markers, and issues hashed magic-link challenge", async () => {
  const { app, repositories, authOutbox } = createTestApp();

  const response = await request(app)
    .post("/api/auth/register")
    .send({
      email: "NewUser@example.com",
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(202);

  assert.equal(response.body.message, "If the email is valid, you will receive a link.");
  assert.equal(repositories.data.users.length, 1);
  assert.equal(repositories.data.users[0].email, "newuser@example.com");
  assert.ok(repositories.data.users[0].registered_at);

  assert.equal(authOutbox.length, 1);
  assert.equal(authOutbox[0].flow, "register");
  assert.equal(authOutbox[0].email, "newuser@example.com");

  assert.equal(repositories.data.authMagicLinks.length, 1);
  assert.equal(
    repositories.data.authMagicLinks[0].token_hash,
    hashSessionToken(authOutbox[0].token)
  );
  assert.equal(repositories.data.authMagicLinks[0].token_hash === authOutbox[0].token, false);
});

test("register upgrades an existing unlock-created user without duplicate account", async () => {
  const { app, repositories, authOutbox } = createTestApp();

  await createUnlockedUser(app, "existing@example.com");

  assert.equal(repositories.data.users.length, 1);
  assert.equal(repositories.data.users[0].registered_at, null);

  const response = await request(app)
    .post("/api/auth/register")
    .send({
      email: "EXISTING@example.com",
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(202);

  assert.equal(response.body.message, "If the email is valid, you will receive a link.");
  assert.equal(repositories.data.users.length, 1);
  assert.ok(repositories.data.users[0].registered_at);
  assert.equal(authOutbox.length, 1);
  assert.equal(authOutbox[0].flow, "register");
});

test("login request response remains generic for both unknown and registered emails", async () => {
  const { app, authOutbox } = createTestApp();

  const unknown = await request(app)
    .post("/api/auth/login/request")
    .send({ email: "unknown@example.com" })
    .expect(202);

  assert.equal(unknown.body.message, "If the email is valid, you will receive a link.");
  assert.equal(authOutbox.length, 0);

  await request(app)
    .post("/api/auth/register")
    .send({
      email: "known@example.com",
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(202);

  const afterRegisterOutboxSize = authOutbox.length;

  const known = await request(app)
    .post("/api/auth/login/request")
    .send({ email: "known@example.com" })
    .expect(202);

  assert.equal(known.body.message, "If the email is valid, you will receive a link.");
  assert.equal(authOutbox.length, afterRegisterOutboxSize + 1);
  assert.equal(authOutbox.at(-1).flow, "login");
});

test("runtime provider adapter is invoked on register and login request", async () => {
  const sentMagicLinks = [];
  const provider = {
    async sendMagicLink(payload) {
      sentMagicLinks.push(payload);
    }
  };

  const { app } = createTestApp({
    useRuntimeAuthService: true,
    magicLinkProvider: provider
  });

  await request(app)
    .post("/api/auth/register")
    .send({
      email: "provider@example.com",
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(202);

  await request(app)
    .post("/api/auth/login/request")
    .send({ email: "provider@example.com" })
    .expect(202);

  assert.equal(sentMagicLinks.length, 2);
  assert.equal(sentMagicLinks[0].flow, "register");
  assert.equal(sentMagicLinks[1].flow, "login");
});

test("verify success establishes session cookie and me/logout lifecycle works", async () => {
  const { app, repositories, authOutbox } = createTestApp();

  await request(app)
    .post("/api/auth/register")
    .send({
      email: "lifecycle@example.com",
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(202);

  const token = authOutbox.at(-1).token;

  const verify = await request(app)
    .post("/api/auth/login/verify")
    .send({ token })
    .expect(200);

  assert.ok(verify.body.user);
  assert.equal(verify.body.user.email, "lifecycle@example.com");
  assert.ok(verify.headers["set-cookie"]);
  const cookie = verify.headers["set-cookie"][0];
  assert.ok(cookie.includes("tmb_session="));

  const me = await request(app).get("/api/auth/me").set("Cookie", cookie).expect(200);
  assert.equal(me.body.user.email, "lifecycle@example.com");

  const logout = await request(app).post("/api/auth/logout").set("Cookie", cookie).expect(204);
  assert.ok(logout.headers["set-cookie"]);

  await request(app).get("/api/auth/me").set("Cookie", cookie).expect(401);

  const consumedChallenges = repositories.data.authMagicLinks.filter((row) => row.used_at != null);
  assert.equal(consumedChallenges.length, 1);
  assert.ok(repositories.data.users[0].last_login_at);
});

test("verify rejects invalid, expired, and reused tokens", async () => {
  const { app, repositories, authOutbox } = createTestApp();

  await request(app)
    .post("/api/auth/login/verify")
    .send({ token: "invalid-token-value-that-was-never-issued" })
    .expect(401);

  await request(app)
    .post("/api/auth/register")
    .send({
      email: "expired@example.com",
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(202);

  const expiredToken = authOutbox.at(-1).token;
  repositories.data.authMagicLinks.at(-1).expires_at = new Date(Date.now() - 1_000);

  await request(app)
    .post("/api/auth/login/verify")
    .send({ token: expiredToken })
    .expect(401);

  await request(app)
    .post("/api/auth/register")
    .send({
      email: "reused@example.com",
      email_consent: true,
      signup_source: "register_page"
    })
    .expect(202);

  const reusableToken = authOutbox.at(-1).token;

  await request(app)
    .post("/api/auth/login/verify")
    .send({ token: reusableToken })
    .expect(200);

  await request(app)
    .post("/api/auth/login/verify")
    .send({ token: reusableToken })
    .expect(401);
});

test("auth limiter returns 429 when threshold is exceeded", async () => {
  const { app } = createTestApp({
    authRateLimitMax: 1,
    authRateLimitWindowMs: 60_000
  });

  await request(app)
    .post("/api/auth/login/request")
    .send({ email: "ratelimit@example.com" })
    .expect(202);

  const blocked = await request(app)
    .post("/api/auth/login/request")
    .send({ email: "ratelimit@example.com" })
    .expect(429);

  assert.equal(blocked.body.message, "Too many auth requests");
  assert.ok(blocked.headers["retry-after"]);
});
