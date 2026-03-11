import { createAuthService } from "../services/authService.js";
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

  const authService = createAuthService({
    authRepository: repositories.authRepository,
    sessionTtlMs: 1000 * 60 * 60 * 24 * 30,
    magicLinkTtlMs: 1000 * 60 * 15,
    sendMagicLink: async ({ email, token, expiresAt, flow }) => {
      console.log(
        `[mock-auth] Magic link (${flow}) for ${email}: token=${token} expires=${expiresAt.toISOString()}`
      );
    }
  });

  return {
    catalogService,
    sessionService,
    recommendationService,
    leadCaptureService,
    authService,
    healthCheck: async () => ({ status: "ok", mode: "mock" })
  };
}
