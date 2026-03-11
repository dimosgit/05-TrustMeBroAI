import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createTestApp } from "../helpers/createTestApp.js";

async function createSessionAndCompute(app) {
  const sessionResponse = await request(app)
    .post("/api/recommendation/session")
    .send({
      profile_id: 1,
      task_id: 1,
      selected_priority: "Best quality",
      wizard_duration_seconds: 22
    })
    .expect(201);

  const sessionId = sessionResponse.body.session_id;

  const computeResponse = await request(app)
    .post("/api/recommendation/compute")
    .send({ session_id: sessionId })
    .expect(200);

  return {
    sessionId,
    compute: computeResponse.body
  };
}

test("anonymous catalog endpoints are available", async () => {
  const { app } = createTestApp();

  await request(app).get("/api/health").expect(200);

  const profiles = await request(app).get("/api/profiles").expect(200);
  const tasks = await request(app).get("/api/tasks").expect(200);
  const priorities = await request(app).get("/api/priorities").expect(200);

  assert.ok(Array.isArray(profiles.body));
  assert.ok(Array.isArray(tasks.body));
  assert.ok(Array.isArray(priorities.body));
});

test("session creation persists wizard_duration_seconds", async () => {
  const { app, repositories } = createTestApp();

  const response = await request(app)
    .post("/api/recommendation/session")
    .send({
      profile_id: 1,
      task_id: 1,
      selected_priority: "Best quality",
      wizard_duration_seconds: 37
    })
    .expect(201);

  const sessionRow = repositories.data.recommendationSessions.find(
    (row) => row.id === response.body.session_id
  );
  assert.equal(sessionRow.wizard_duration_seconds, 37);
});

test("session creation rejects negative wizard_duration_seconds", async () => {
  const { app } = createTestApp();

  const response = await request(app)
    .post("/api/recommendation/session")
    .send({
      profile_id: 1,
      task_id: 1,
      selected_priority: "Best quality",
      wizard_duration_seconds: -1
    })
    .expect(400);

  assert.equal(response.body.message, "wizard_duration_seconds must be a non-negative integer");
});

test("catalog endpoints allow both localhost and 127 local dev origins", async () => {
  const { app } = createTestApp();

  const localhost = await request(app)
    .get("/api/profiles")
    .set("Origin", "http://localhost:5174")
    .expect(200);
  assert.equal(localhost.headers["access-control-allow-origin"], "http://localhost:5174");

  const loopback = await request(app)
    .get("/api/profiles")
    .set("Origin", "http://127.0.0.1:5174")
    .expect(200);
  assert.equal(loopback.headers["access-control-allow-origin"], "http://127.0.0.1:5174");

  const wildcardDevHost = await request(app)
    .get("/api/profiles")
    .set("Origin", "http://0.0.0.0:5174")
    .expect(200);
  assert.equal(wildcardDevHost.headers["access-control-allow-origin"], "http://0.0.0.0:5174");
});

test("compute endpoint returns locked payload with one primary and two minimal alternatives", async () => {
  const { app } = createTestApp();
  const { compute, sessionId } = await createSessionAndCompute(app);

  assert.equal(compute.session_id, sessionId);
  assert.ok(compute.recommendation_id);
  assert.equal(compute.primary_tool.locked, true);
  assert.ok(compute.primary_tool.tool_name);
  assert.equal(Object.keys(compute.primary_tool).sort().join(","), "locked,tool_name");

  assert.equal(compute.alternative_tools.length, 2);
  for (const tool of compute.alternative_tools) {
    assert.ok("tool_name" in tool);
    assert.ok("context_word" in tool);
    assert.equal(Object.keys(tool).sort().join(","), "context_word,tool_name");
  }

  assert.equal("score" in compute.primary_tool, false);
  assert.equal("quality" in compute.primary_tool, false);
});

test("unlock upserts user, unlocks recommendation, and prefers referral_url for try_it_url", async () => {
  const { app, repositories } = createTestApp();

  const codingSession = await request(app)
    .post("/api/recommendation/session")
    .send({
      profile_id: 2,
      task_id: 4,
      selected_priority: "Fastest results",
      wizard_duration_seconds: 18
    })
    .expect(201);

  const compute = await request(app)
    .post("/api/recommendation/compute")
    .send({ session_id: codingSession.body.session_id })
    .expect(200);

  const unlock = await request(app)
    .post("/api/recommendation/unlock")
    .send({
      session_id: codingSession.body.session_id,
      recommendation_id: compute.body.recommendation_id,
      email: "lead@example.com",
      email_consent: true,
      signup_source: "wizard"
    })
    .expect(200);

  assert.ok(unlock.headers["set-cookie"]);
  assert.ok(unlock.headers["set-cookie"][0].includes("tmb_session="));

  assert.equal(unlock.body.primary_tool.locked, false);
  assert.ok(unlock.body.primary_tool.primary_reason);
  assert.ok(unlock.body.primary_tool.tool_name);
  assert.ok(unlock.body.primary_tool.try_it_url);

  const createdUser = repositories.data.users[0];
  assert.equal(createdUser.email, "lead@example.com");
  assert.equal(createdUser.email_consent, true);

  const linkedSession = repositories.data.recommendationSessions.find(
    (row) => row.id === codingSession.body.session_id
  );
  assert.ok(linkedSession.user_id);

  const unlockedRecommendation = repositories.data.recommendations.find(
    (row) => row.id === compute.body.recommendation_id
  );
  assert.equal(unlockedRecommendation.is_primary_locked, false);
  assert.ok(unlockedRecommendation.unlocked_at);

  const secondUnlock = await request(app)
    .post("/api/recommendation/unlock")
    .send({
      session_id: codingSession.body.session_id,
      recommendation_id: compute.body.recommendation_id,
      email: "LEAD@example.com",
      email_consent: true,
      signup_source: "wizard-repeat"
    })
    .expect(200);

  assert.equal(secondUnlock.body.primary_tool.locked, false);
  assert.equal(repositories.data.users.length, 1);
});

test("returning user can unlock without re-entering email when session cookie is present", async () => {
  const { app } = createTestApp();

  const first = await createSessionAndCompute(app);
  const initialUnlock = await request(app)
    .post("/api/recommendation/unlock")
    .send({
      session_id: first.sessionId,
      recommendation_id: first.compute.recommendation_id,
      email: "remembered@example.com",
      email_consent: true,
      signup_source: "wizard"
    })
    .expect(200);

  const sessionCookie = initialUnlock.headers["set-cookie"]?.[0];
  assert.ok(sessionCookie);

  const second = await createSessionAndCompute(app);
  const rememberedUnlock = await request(app)
    .post("/api/recommendation/unlock")
    .set("Cookie", sessionCookie)
    .send({
      session_id: second.sessionId,
      recommendation_id: second.compute.recommendation_id
    })
    .expect(200);

  assert.equal(rememberedUnlock.body.primary_tool.locked, false);
  assert.ok(rememberedUnlock.headers["set-cookie"]);
  assert.ok(rememberedUnlock.headers["set-cookie"][0].includes("tmb_session="));
});

test("feedback accepts only -1 or 1", async () => {
  const { app } = createTestApp();
  const { compute } = await createSessionAndCompute(app);

  await request(app)
    .post(`/api/recommendation/${compute.recommendation_id}/feedback`)
    .send({ signal: 1 })
    .expect(201);

  await request(app)
    .post(`/api/recommendation/${compute.recommendation_id}/feedback`)
    .send({ signal: -1 })
    .expect(201);

  await request(app)
    .post(`/api/recommendation/${compute.recommendation_id}/feedback`)
    .send({ signal: 0 })
    .expect(400);
});

test("unlock rejects recommendation/session mismatch", async () => {
  const { app } = createTestApp();

  const first = await createSessionAndCompute(app);
  const second = await createSessionAndCompute(app);

  const response = await request(app)
    .post("/api/recommendation/unlock")
    .send({
      session_id: second.sessionId,
      recommendation_id: first.compute.recommendation_id,
      email: "mismatch@example.com",
      email_consent: true,
      signup_source: "wizard"
    })
    .expect(400);

  assert.equal(response.body.message, "recommendation_id does not belong to session_id");
});

test("try-it click is recorded for unlocked recommendation and is idempotent", async () => {
  const { app, repositories } = createTestApp();
  const { sessionId, compute } = await createSessionAndCompute(app);

  await request(app)
    .post("/api/recommendation/unlock")
    .send({
      session_id: sessionId,
      recommendation_id: compute.recommendation_id,
      email: "tryit@example.com",
      email_consent: true,
      signup_source: "wizard"
    })
    .expect(200);

  const clickOne = await request(app)
    .post(`/api/recommendation/${compute.recommendation_id}/try-it-click`)
    .send({ session_id: sessionId })
    .expect(201);

  const clickTwo = await request(app)
    .post(`/api/recommendation/${compute.recommendation_id}/try-it-click`)
    .send({ session_id: sessionId })
    .expect(201);

  assert.equal(clickOne.body.recommendation_id, compute.recommendation_id);
  assert.equal(clickOne.body.session_id, sessionId);
  assert.equal(clickOne.body.id, clickTwo.body.id);
  assert.equal(repositories.data.tryItClicks.length, 1);
});

test("try-it click rejects recommendation/session mismatch", async () => {
  const { app } = createTestApp();
  const first = await createSessionAndCompute(app);
  const second = await createSessionAndCompute(app);

  await request(app)
    .post("/api/recommendation/unlock")
    .send({
      session_id: first.sessionId,
      recommendation_id: first.compute.recommendation_id,
      email: "click-mismatch@example.com",
      email_consent: true,
      signup_source: "wizard"
    })
    .expect(200);

  const response = await request(app)
    .post(`/api/recommendation/${first.compute.recommendation_id}/try-it-click`)
    .send({ session_id: second.sessionId })
    .expect(400);

  assert.equal(response.body.message, "recommendation_id does not belong to session_id");
});

test("try-it click requires unlocked recommendation", async () => {
  const { app } = createTestApp();
  const { sessionId, compute } = await createSessionAndCompute(app);

  const response = await request(app)
    .post(`/api/recommendation/${compute.recommendation_id}/try-it-click`)
    .send({ session_id: sessionId })
    .expect(400);

  assert.equal(response.body.message, "Recommendation must be unlocked before tracking try-it click");
});
