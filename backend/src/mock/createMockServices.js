import { createAuthService } from "../services/authService.js";
import { createCatalogService } from "../services/catalogService.js";
import { createLeadCaptureService } from "../services/leadCaptureService.js";
import { createFollowBuildService } from "../services/followBuildService.js";
import { createPasskeyAdapter } from "../services/passkeyAdapter.js";
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
  const followBuildService = createFollowBuildService({
    userRepository: repositories.userRepository
  });

  const authService = createAuthService({
    authRepository: repositories.authRepository,
    passkeyAdapter: createPasskeyAdapter({
      rpId: "localhost",
      rpName: "TrustMeBroAI Mock",
      origins: "http://localhost:5174,http://127.0.0.1:5174"
    }),
    sessionTtlMs: 1000 * 60 * 60 * 24 * 30,
    passkeyChallengeTtlMs: 1000 * 60 * 5,
    recoveryTokenTtlMs: 1000 * 60 * 20,
    sendRecoveryLink: async ({ email, token, expiresAt, flow }) => {
      console.log(
        `[mock-auth] Recovery link (${flow}) for ${email}: token=${token} expires=${expiresAt.toISOString()}`
      );
    }
  });

  return {
    metricsRepository: repositories.metricsRepository,
    catalogService,
    sessionService,
    recommendationService,
    leadCaptureService,
    followBuildService,
    authService,
    healthCheck: async () => ({ status: "ok", mode: "mock" })
  };
}
