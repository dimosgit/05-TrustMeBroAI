import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

export function createHealthRouter({ healthCheck }) {
  const router = Router();

  router.get(
    "/health",
    asyncHandler(async (_req, res) => {
      const payload = await healthCheck();
      return res.json(payload);
    })
  );

  return router;
}
