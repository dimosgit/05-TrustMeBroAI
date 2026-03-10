import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { assertPositiveInteger, assertValidEmail, normalizeEmail } from "../utils/validators.js";

export function createRecommendationRouter({
  sessionService,
  recommendationService,
  leadCaptureService,
  sessionRateLimiter,
  computeRateLimiter,
  unlockRateLimiter,
  feedbackRateLimiter,
  tryItRateLimiter
}) {
  const router = Router();

  router.post(
    "/recommendation/session",
    sessionRateLimiter,
    asyncHandler(async (req, res) => {
      const result = await sessionService.createAnonymousSession({
        profileId: req.body?.profile_id,
        taskId: req.body?.task_id,
        selectedPriority: req.body?.selected_priority,
        wizardDurationSeconds: req.body?.wizard_duration_seconds
      });

      return res.status(201).json(result);
    })
  );

  router.post(
    "/recommendation/compute",
    computeRateLimiter,
    asyncHandler(async (req, res) => {
      const sessionId = assertPositiveInteger(req.body?.session_id, "session_id");
      const result = await recommendationService.computeForSession({ sessionId });
      return res.json(result);
    })
  );

  router.post(
    "/recommendation/unlock",
    unlockRateLimiter,
    asyncHandler(async (req, res) => {
      const recommendationId = assertPositiveInteger(
        req.body?.recommendation_id,
        "recommendation_id"
      );
      const sessionId = assertPositiveInteger(req.body?.session_id, "session_id");
      const email = normalizeEmail(req.body?.email);
      assertValidEmail(email);

      const result = await leadCaptureService.unlockRecommendation({
        recommendationId,
        sessionId,
        email,
        emailConsent: req.body?.email_consent,
        signupSource: req.body?.signup_source
      });

      return res.json(result);
    })
  );

  router.post(
    "/recommendation/:id/feedback",
    feedbackRateLimiter,
    asyncHandler(async (req, res) => {
      const recommendationId = assertPositiveInteger(req.params.id, "id");
      const feedback = await recommendationService.recordFeedback({
        recommendationId,
        signal: req.body?.signal
      });

      return res.status(201).json(feedback);
    })
  );

  router.post(
    "/recommendation/:id/try-it-click",
    tryItRateLimiter,
    asyncHandler(async (req, res) => {
      const recommendationId = assertPositiveInteger(req.params.id, "id");
      const sessionId = assertPositiveInteger(req.body?.session_id, "session_id");

      const event = await recommendationService.recordTryItClick({
        recommendationId,
        sessionId
      });

      return res.status(201).json(event);
    })
  );

  return router;
}
