import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

export function createSessionRouter({ userSessionService, requireAuth, sessionRateLimiter }) {
  const router = Router();

  router.post(
    "/session",
    sessionRateLimiter,
    requireAuth,
    asyncHandler(async (req, res) => {
      const createdSession = await userSessionService.createUserSession({
        userId: req.user.id,
        profileId: req.body?.profile_id,
        taskId: req.body?.task_id,
        budget: req.body?.budget,
        experienceLevel: req.body?.experience_level,
        selectedPriorities: req.body?.selected_priorities || []
      });

      return res.status(201).json({
        id: createdSession.id,
        created_at: createdSession.created_at
      });
    })
  );

  return router;
}
