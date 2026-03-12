import { createApp } from "../../src/app.js";
import { createAuthService } from "../../src/services/authService.js";
import { createCatalogService } from "../../src/services/catalogService.js";
import { createLeadCaptureService } from "../../src/services/leadCaptureService.js";
import { createRecommendationService } from "../../src/services/recommendationService.js";
import { createResultService } from "../../src/services/resultService.js";
import { createSessionService } from "../../src/services/sessionService.js";
import { createFakePasskeyAdapter } from "./fakePasskeyAdapter.js";
import { createInMemoryRepositories } from "./inMemoryRepositories.js";

export function createTestApp(options = {}) {
  const repositories = createInMemoryRepositories();
  const authOutbox = [];
  const passkeyAdapter = options.passkeyAdapter || createFakePasskeyAdapter();

  const deliveryProvider =
    options.magicLinkProvider ||
    {
      async sendMagicLink(payload) {
        authOutbox.push(payload);
      }
    };

  const config = {
    nodeEnv: options.nodeEnv || "test",
    isProduction: options.isProduction || false,
    port: 0,
    databaseUrl: "test",
    auth: {
      magicLinkTtlMs: 1000 * 60 * 15,
      passkeyChallengeTtlMs: 1000 * 60 * 5,
      recoveryTokenTtlMs: 1000 * 60 * 20,
      webauthnRpId: "localhost",
      webauthnRpName: "TrustMeBroAI Test",
      webauthnOrigins: "http://localhost:5174,http://127.0.0.1:5174",
      magicLinkBaseUrl: "http://localhost:5174/auth/verify",
      magicLinkProvider: options.magicLinkProviderMode || "console"
    },
    allowedOrigins: ["http://localhost:5174", "http://127.0.0.1:5174"],
    session: {
      cookieName: "tmb_session",
      ttlMs: 1000 * 60 * 60 * 24 * 30
    },
    rateLimits: {
      auth: {
        windowMs: options.authRateLimitWindowMs || 60_000,
        max: options.authRateLimitMax || 1000
      },
      authMe: { windowMs: 60_000, max: 1000 },
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

  const baseAppOptions = {
    config,
    metricsRepository: repositories.metricsRepository,
    catalogService,
    sessionService,
    recommendationService,
    leadCaptureService,
    healthCheck: async () => ({ status: "ok", mode: "test" })
  };

  let authService = null;

  if (options.useRuntimeAuthService) {
    const app = createApp({
      ...baseAppOptions,
      authRepository: repositories.authRepository,
      magicLinkProvider: deliveryProvider,
      passkeyAdapter
    });

    return {
      app,
      repositories,
      authOutbox,
      services: {
        catalogService,
        sessionService,
        recommendationService,
        leadCaptureService,
        authService,
        resultService
      }
    };
  }

  authService = createAuthService({
    authRepository: repositories.authRepository,
    passkeyAdapter,
    sessionTtlMs: config.session.ttlMs,
    passkeyChallengeTtlMs: config.auth.passkeyChallengeTtlMs,
    recoveryTokenTtlMs: config.auth.recoveryTokenTtlMs,
    sendRecoveryLink: (payload) => deliveryProvider.sendMagicLink(payload)
  });

  const app = createApp({
    ...baseAppOptions,
    authService
  });

  return {
    app,
    repositories,
    authOutbox,
    services: {
      catalogService,
      sessionService,
      recommendationService,
      leadCaptureService,
      authService,
      resultService
    }
  };
}
