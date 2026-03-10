import { createCatalogService } from "../services/catalogService.js";
import { createLeadCaptureService } from "../services/leadCaptureService.js";
import { createRecommendationService } from "../services/recommendationService.js";
import { createResultService } from "../services/resultService.js";
import { createSessionService } from "../services/sessionService.js";
import { createInMemoryRepositories } from "./inMemoryRepositories.js";

export function createMockRuntimeDependencies() {
  const repositories = createInMemoryRepositories();

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

  return {
    catalogService,
    sessionService,
    recommendationService,
    leadCaptureService,
    healthCheck: async () => ({ status: "ok", mode: "mock" })
  };
}
