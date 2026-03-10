import { createApp } from "../../src/app.js";
import { createCatalogService } from "../../src/services/catalogService.js";
import { createLeadCaptureService } from "../../src/services/leadCaptureService.js";
import { createRecommendationService } from "../../src/services/recommendationService.js";
import { createResultService } from "../../src/services/resultService.js";
import { createSessionService } from "../../src/services/sessionService.js";
import { createInMemoryRepositories } from "./inMemoryRepositories.js";

export function createTestApp() {
  const repositories = createInMemoryRepositories();

  const config = {
    nodeEnv: "test",
    isProduction: false,
    port: 0,
    databaseUrl: "test",
    allowedOrigins: ["http://localhost:5174", "http://127.0.0.1:5174"],
    rateLimits: {
      recommendationSession: { windowMs: 60_000, max: 1000 },
      recommendationCompute: { windowMs: 60_000, max: 1000 },
      recommendationUnlock: { windowMs: 60_000, max: 1000 },
      recommendationFeedback: { windowMs: 60_000, max: 1000 },
      recommendationTryItClick: { windowMs: 60_000, max: 1000 }
    }
  };

  const catalogService = createCatalogService({
    catalogRepository: repositories.catalogRepository
  });

  const resultService = createResultService();

  const sessionService = createSessionService({
    sessionRepository: repositories.sessionRepository,
    catalogService
  });

  const recommendationService = createRecommendationService({
    sessionRepository: repositories.sessionRepository,
    recommendationRepository: repositories.recommendationRepository,
    toolRepository: repositories.toolRepository,
    resultService
  });

  const leadCaptureService = createLeadCaptureService({
    recommendationRepository: repositories.recommendationRepository,
    sessionRepository: repositories.sessionRepository,
    userRepository: repositories.userRepository,
    toolRepository: repositories.toolRepository,
    resultService
  });

  const app = createApp({
    config,
    catalogService,
    sessionService,
    recommendationService,
    leadCaptureService,
    healthCheck: async () => ({ status: "ok", mode: "test" })
  });

  return {
    app,
    repositories,
    services: {
      catalogService,
      sessionService,
      recommendationService,
      leadCaptureService,
      resultService
    }
  };
}
