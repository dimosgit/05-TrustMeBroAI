import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createTestApp } from "../helpers/createTestApp.js";

test("follow-the-build capture rejects invalid email", async () => {
  const { app } = createTestApp();

  const response = await request(app)
    .post("/api/follow-the-build/capture")
    .send({
      email: "not-an-email",
      email_consent: true
    })
    .expect(400);

  assert.equal(response.body.message, "A valid email is required");
});

test("follow-the-build capture requires consent=true", async () => {
  const { app } = createTestApp();

  const response = await request(app)
    .post("/api/follow-the-build/capture")
    .send({
      email: "follow@example.com",
      email_consent: false
    })
    .expect(400);

  assert.equal(response.body.message, "email_consent must be true");
});

test("follow-the-build capture persists distinct source and records funnel event", async () => {
  const { app, repositories } = createTestApp();

  const first = await request(app)
    .post("/api/follow-the-build/capture")
    .send({
      email: "follow@example.com",
      email_consent: true
    })
    .expect(201);

  assert.equal(first.body.captured, true);
  assert.equal(first.body.created, true);
  assert.equal(first.body.email, "follow@example.com");
  assert.equal(first.body.signup_source, "follow_the_build");

  await request(app)
    .post("/api/follow-the-build/capture")
    .send({
      email: "FOLLOW@example.com",
      email_consent: true
    })
    .expect(200);

  assert.equal(repositories.data.users.length, 1);
  assert.equal(repositories.data.users[0].email, "follow@example.com");
  assert.equal(repositories.data.users[0].signup_source, "follow_the_build");

  const events = repositories.data.funnelEvents.filter(
    (event) => event.event_name === "follow_the_build_captured"
  );

  assert.equal(events.length, 2);
  assert.equal(events[0].event_metadata.source, "follow_the_build_capture");
  assert.equal(events[0].event_metadata.created, true);
  assert.equal(events[1].event_metadata.created, false);
});

test("follow-the-build capture does not overwrite existing non-follow signup source", async () => {
  const { app, repositories } = createTestApp();

  await request(app)
    .post("/api/recommendation/session")
    .send({
      profile_id: 1,
      task_id: 1,
      selected_priority: "Best quality",
      wizard_duration_seconds: 10
    })
    .expect(201);

  const created = await repositories.userRepository.upsertUser({
    email: "existing-source@example.com",
    emailConsent: true,
    consentTimestamp: new Date(),
    signupSource: "landing"
  });
  assert.equal(created.signup_source, "landing");

  const response = await request(app)
    .post("/api/follow-the-build/capture")
    .send({
      email: "existing-source@example.com",
      email_consent: true
    })
    .expect(200);

  assert.equal(response.body.created, false);
  assert.equal(response.body.signup_source, "landing");

  const updatedUser = repositories.data.users.find((row) => row.email === "existing-source@example.com");
  assert.equal(updatedUser.signup_source, "landing");
});
