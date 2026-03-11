import assert from "node:assert/strict";
import test from "node:test";
import { createLeadCaptureService } from "../../src/services/leadCaptureService.js";
import { createRecommendationService } from "../../src/services/recommendationService.js";

test("leadCaptureService unlockRecommendation accepts pg-style string IDs", async () => {
  const calls = {};

  const leadCaptureService = createLeadCaptureService({
    recommendationRepository: {
      async findRecommendationById(id) {
        assert.equal(id, 77);
        return {
          id: "77",
          session_id: "19",
          primary_tool_id: "5",
          primary_reason: "Best match",
          unlocked_at: null
        };
      },
      async unlockRecommendation(id) {
        assert.equal(id, 77);
        return {
          id: "77",
          session_id: "19",
          primary_tool_id: "5",
          primary_reason: "Best match",
          unlocked_at: "2026-03-11T08:00:00.000Z"
        };
      }
    },
    sessionRepository: {
      async linkSessionToUser({ sessionId, userId }) {
        calls.linkSession = { sessionId, userId };
      }
    },
    userRepository: {
      async upsertUser({ email, emailConsent, signupSource, consentTimestamp }) {
        calls.user = {
          email,
          emailConsent,
          signupSource,
          hasTimestamp: consentTimestamp instanceof Date
        };
        return { id: "501" };
      }
    },
    toolRepository: {
      async getToolById(id) {
        calls.primaryToolId = id;
        return { id, tool_name: "Claude", website: "https://claude.ai" };
      }
    },
    resultService: {
      buildUnlockedResult(payload) {
        calls.unlockedPayload = payload;
        return payload;
      }
    }
  });

  const result = await leadCaptureService.unlockRecommendation({
    recommendationId: 77,
    sessionId: 19,
    email: "User@Example.com",
    emailConsent: true,
    signupSource: "wizard"
  });

  assert.equal(calls.user.email, "user@example.com");
  assert.equal(calls.user.emailConsent, true);
  assert.equal(calls.user.signupSource, "wizard");
  assert.equal(calls.user.hasTimestamp, true);
  assert.equal(calls.linkSession.sessionId, 19);
  assert.equal(calls.linkSession.userId, 501);
  assert.equal(calls.primaryToolId, 5);
  assert.equal(result.user.id, 501);
  assert.equal(result.unlockedResult.sessionId, 19);
  assert.equal(result.unlockedResult.recommendationId, 77);
});

test("recordTryItClick accepts pg-style string session_id on recommendation row", async () => {
  const recommendationService = createRecommendationService({
    sessionRepository: {},
    recommendationRepository: {
      async findRecommendationById(id) {
        assert.equal(id, 311);
        return {
          id: 311,
          session_id: "44",
          is_primary_locked: false
        };
      },
      async createTryItClick({ recommendationId, sessionId }) {
        return {
          id: 1,
          recommendation_id: recommendationId,
          session_id: sessionId
        };
      }
    },
    toolRepository: {},
    resultService: {}
  });

  const event = await recommendationService.recordTryItClick({
    recommendationId: 311,
    sessionId: 44
  });

  assert.deepEqual(event, {
    id: 1,
    recommendation_id: 311,
    session_id: 44
  });
});
