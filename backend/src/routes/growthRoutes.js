import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { FOLLOW_THE_BUILD_SIGNUP_SOURCE } from "../services/followBuildService.js";

export function createGrowthRouter({ followBuildService, followBuildRateLimiter, metricsService }) {
  const router = Router();

  router.post(
    "/follow-the-build/capture",
    followBuildRateLimiter,
    asyncHandler(async (req, res) => {
      const result = await followBuildService.captureEmail({
        email: req.body?.email,
        emailConsent: req.body?.email_consent
      });

      await metricsService?.captureFunnelEvent({
        eventName: "follow_the_build_captured",
        userId: result.user.id,
        eventMetadata: {
          source: "follow_the_build_capture",
          created: result.created
        }
      });

      return res.status(result.created ? 201 : 200).json({
        captured: true,
        created: result.created,
        user_id: result.user.id,
        email: result.user.email,
        signup_source: result.user.signup_source || FOLLOW_THE_BUILD_SIGNUP_SOURCE
      });
    })
  );

  return router;
}
