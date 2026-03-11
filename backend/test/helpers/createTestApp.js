import { createApp } from "../../src/app.js";
import { createCatalogService } from "../../src/services/catalogService.js";
import { createLeadCaptureService } from "../../src/services/leadCaptureService.js";
import { createRecommendationService } from "../../src/services/recommendationService.js";
import { createResultService } from "../../src/services/resultService.js";
import { createSessionService } from "../../src/services/sessionService.js";
import { createInMemoryRepositories } from "./inMemoryRepositories.js";

function createInMemoryAuthService({ repositories, sessionTtlMs }) {
  let nextSessionId = 1;
  const tokenToSession = new Map();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  return {
    async issueSessionForUser({ userId }) {
      const token = `test-session-${nextSessionId}-${Date.now()}`;
      const session = {
        id: nextSessionId++,
        user_id: userId,
        expires_at: new Date(Date.now() + sessionTtlMs),
        created_at: new Date()
      };
      tokenToSession.set(token, session);
      return {
        token,
        expiresAt: session.expires_at
      };
    },

    async authenticateSessionToken(token) {
      const session = tokenToSession.get(token);
      if (!session) {
        return null;
      }

      if (session.expires_at <= new Date()) {
        tokenToSession.delete(token);
        return null;
      }

      const user = repositories.data.users.find((candidate) => candidate.id === session.user_id);
      if (!user) {
        return null;
      }

      return {
        user: clone(user),
        session: clone(session)
      };
    },

    async logoutBySessionId(sessionId) {
      for (const [token, session] of tokenToSession.entries()) {
        if (session.id === sessionId) {
          tokenToSession.delete(token);
          return;
        }
      }
    },

    async logoutByToken(token) {
      tokenToSession.delete(token);
    }
  };
}

export function createTestApp() {
  const repositories = createInMemoryRepositories();

  const config = {
    nodeEnv: "test",
    isProduction: false,
    port: 0,
    databaseUrl: "test",
    allowedOrigins: ["http://localhost:5174", "http://127.0.0.1:5174"],
    session: {
      cookieName: "tmb_session",
      ttlMs: 1000 * 60 * 60 * 24 * 30
    },
    rateLimits: {
      auth: { windowMs: 60_000, max: 1000 },
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

  const authService = createInMemoryAuthService({
    repositories,
    sessionTtlMs: config.session.ttlMs
  });

  const app = createApp({
    config,
    authService,
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
      authService,
      resultService
    }
  };
}
