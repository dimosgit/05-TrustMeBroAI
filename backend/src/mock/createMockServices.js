import { createCatalogService } from "../services/catalogService.js";
import { createLeadCaptureService } from "../services/leadCaptureService.js";
import { createRecommendationService } from "../services/recommendationService.js";
import { createResultService } from "../services/resultService.js";
import { createSessionService } from "../services/sessionService.js";
import { createInMemoryRepositories } from "./inMemoryRepositories.js";

function createInMemoryAuthService({ repositories, sessionTtlMs = 1000 * 60 * 60 * 24 * 30 }) {
  let nextSessionId = 1;
  const tokenToSession = new Map();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  return {
    async issueSessionForUser({ userId }) {
      const token = `mock-session-${nextSessionId}-${Date.now()}`;
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

  const authService = createInMemoryAuthService({
    repositories
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
