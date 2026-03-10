import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

export function createCatalogRouter({ catalogService }) {
  const router = Router();

  router.get(
    "/profiles",
    asyncHandler(async (_req, res) => {
      const data = await catalogService.getProfiles();
      return res.json(data);
    })
  );

  router.get(
    "/tasks",
    asyncHandler(async (_req, res) => {
      const data = await catalogService.getTasks();
      return res.json(data);
    })
  );

  router.get(
    "/priorities",
    asyncHandler(async (_req, res) => {
      const data = await catalogService.getPriorities();
      return res.json(data);
    })
  );

  return router;
}
