import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { serializeCookie } from "../utils/cookies.js";
import { assertPositiveInteger, assertValidEmail, normalizeEmail } from "../utils/validators.js";

function setSessionCookie({ res, cookieName, token, maxAgeMs, isProduction }) {
  if (!cookieName || !token || !maxAgeMs) {
    return;
  }

  res.setHeader(
    "Set-Cookie",
    serializeCookie(cookieName, token, {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAgeMs
    })
  );
}

export function createRecommendationRouter({
  sessionService,
  recommendationService,
  leadCaptureService,
  authService,
  requireAuth,
  sessionCookieName,
  sessionTtlMs,
  isProduction,
  sessionRateLimiter,
  computeRateLimiter,
  unlockRateLimiter,
  feedbackRateLimiter,
  tryItRateLimiter,
  meRateLimiter,
  metricsService
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

  router.get(
    "/recommendation/history",
    meRateLimiter,
    requireAuth,
    asyncHandler(async (req, res) => {
      const rawLimit = Number.parseInt(req.query?.limit, 10);
      const rawOffset = Number.parseInt(req.query?.offset, 10);
      const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 20;
      const offset = Number.isInteger(rawOffset) ? Math.max(rawOffset, 0) : 0;

      const items = await recommendationService.listHistoryForUser({
        userId: req.user.id,
        limit,
        offset
      });

      return res.json({
        items,
        limit,
        offset
      });
    })
  );

  router.get(
    "/recommendation/history/:id",
    meRateLimiter,
    requireAuth,
    asyncHandler(async (req, res) => {
      const recommendationId = assertPositiveInteger(req.params.id, "id");

      const item = await recommendationService.getHistoryItemForUser({
        userId: req.user.id,
        recommendationId
      });

      return res.json(item);
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
      const providedEmail = normalizeEmail(req.body?.email);
      const hasProvidedEmail = Boolean(providedEmail);
      const isRememberedUserUnlock = !hasProvidedEmail && Boolean(req.user?.email);

      const email = isRememberedUserUnlock ? normalizeEmail(req.user.email) : providedEmail;
      assertValidEmail(email);

      const emailConsent = isRememberedUserUnlock ? true : req.body?.email_consent;
      const signupSource =
        req.body?.signup_source ||
        (isRememberedUserUnlock ? "returning-user-auto-unlock" : "landing");

      const { unlockedResult, user } = await leadCaptureService.unlockRecommendation({
        recommendationId,
        sessionId,
        email,
        emailConsent,
        signupSource
      });

      if (authService?.issueSessionForUser && user?.id) {
        const authSession = await authService.issueSessionForUser({
          userId: user.id,
          userAgent: req.headers["user-agent"] || null,
          ipAddress: req.ip || req.socket?.remoteAddress || null
        });

        setSessionCookie({
          res,
          cookieName: sessionCookieName,
          token: authSession.token,
          maxAgeMs: sessionTtlMs,
          isProduction
        });
      }

      await metricsService?.captureFunnelEvent({
        eventName: "recommendation_unlocked",
        userId: user?.id || req.user?.id || null,
        sessionId,
        recommendationId,
        eventMetadata: {
          source: "recommendation_unlock"
        }
      });

      return res.json(unlockedResult);
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

      const recommendation = await recommendationService.getRecommendationById(recommendationId);
      await metricsService?.captureFunnelEvent({
        eventName: "try_it_clicked",
        userId: recommendation.user_id || null,
        sessionId,
        recommendationId,
        eventMetadata: {
          click_event_id: event.id
        }
      });

      return res.status(201).json(event);
    })
  );

  return router;
}
