import express from "express";
import cors from "cors";
import { loadRuntimeConfig } from "./config/env.js";
import { query as defaultQuery } from "./db.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { createIpRateLimiter } from "./middleware/rateLimiter.js";
import { createSessionParser, requireAuth } from "./middleware/authSession.js";
import { createAuthRepository } from "./repositories/authRepository.js";
import { createCatalogRepository } from "./repositories/catalogRepository.js";
import { createRecommendationRepository } from "./repositories/recommendationRepository.js";
import { createSessionRepository } from "./repositories/sessionRepository.js";
import { createToolRepository } from "./repositories/toolRepository.js";
import { createUserRepository } from "./repositories/userRepository.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { createCatalogRouter } from "./routes/catalogRoutes.js";
import { createHealthRouter } from "./routes/healthRoutes.js";
import { createRecommendationRouter } from "./routes/recommendationRoutes.js";
import { createAuthService } from "./services/authService.js";
import { createCatalogService } from "./services/catalogService.js";
import { createLeadCaptureService } from "./services/leadCaptureService.js";
import { createMagicLinkProvider } from "./services/magicLinkProvider.js";
import { createRecommendationService } from "./services/recommendationService.js";
import { createResultService } from "./services/resultService.js";
import { createSessionService } from "./services/sessionService.js";

export function createApp(options = {}) {
  const config = options.config || loadRuntimeConfig(options.env);
  const queryFn = options.queryFn || defaultQuery;
  const corsOrigin = config.isProduction ? config.allowedOrigins : true;
  const sessionCookieName = config.session?.cookieName || "tmb_session";
  const sessionTtlMs = config.session?.ttlMs || 1000 * 60 * 60 * 24 * 30;
  const magicLinkTtlMs = config.auth?.magicLinkTtlMs || 1000 * 60 * 15;
  const magicLinkProviderMode = config.auth?.magicLinkProvider || "console";

  const catalogRepository =
    options.catalogRepository || createCatalogRepository({ query: queryFn });
  const sessionRepository =
    options.sessionRepository || createSessionRepository({ query: queryFn });
  const toolRepository = options.toolRepository || createToolRepository({ query: queryFn });
  const recommendationRepository =
    options.recommendationRepository || createRecommendationRepository({ query: queryFn });
  const userRepository = options.userRepository || createUserRepository({ query: queryFn });
  const authRepository = options.authRepository || createAuthRepository({ query: queryFn });

  const magicLinkProvider =
    options.magicLinkProvider ||
    (!options.authService
      ? createMagicLinkProvider({
          mode: magicLinkProviderMode,
          isProduction: config.isProduction,
          baseUrl: config.auth?.magicLinkBaseUrl,
          resendApiKey: config.auth?.magicLinkResendApiKey,
          fromEmail: config.auth?.magicLinkFromEmail,
          fromName: config.auth?.magicLinkFromName
        })
      : null);

  const catalogService = options.catalogService || createCatalogService({ catalogRepository });
  const resultService = options.resultService || createResultService();
  const authService =
    options.authService ||
    createAuthService({
      authRepository,
      sessionTtlMs,
      magicLinkTtlMs,
      sendMagicLink: ({ email, token, expiresAt, flow }) =>
        magicLinkProvider.sendMagicLink({ email, token, expiresAt, flow }),
      onMagicLinkIssued: options.onMagicLinkIssued
    });
  const sessionService =
    options.sessionService || createSessionService({ sessionRepository, catalogService });
  const recommendationService =
    options.recommendationService ||
    createRecommendationService({
      sessionRepository,
      recommendationRepository,
      toolRepository,
      resultService
    });
  const leadCaptureService =
    options.leadCaptureService ||
    createLeadCaptureService({
      recommendationRepository,
      sessionRepository,
      userRepository,
      toolRepository,
      resultService
    });
  const sessionParser =
    options.sessionParser ||
    createSessionParser({
      authService,
      cookieName: sessionCookieName
    });

  const sessionRateLimiter = createIpRateLimiter({
    windowMs: config.rateLimits.recommendationSession.windowMs,
    max: config.rateLimits.recommendationSession.max,
    message: "Too many session requests"
  });

  const computeRateLimiter = createIpRateLimiter({
    windowMs: config.rateLimits.recommendationCompute.windowMs,
    max: config.rateLimits.recommendationCompute.max,
    message: "Too many compute requests"
  });

  const unlockRateLimiter = createIpRateLimiter({
    windowMs: config.rateLimits.recommendationUnlock.windowMs,
    max: config.rateLimits.recommendationUnlock.max,
    message: "Too many unlock requests"
  });

  const feedbackRateLimiter = createIpRateLimiter({
    windowMs: config.rateLimits.recommendationFeedback.windowMs,
    max: config.rateLimits.recommendationFeedback.max,
    message: "Too many feedback requests"
  });

  const tryItRateLimiter = createIpRateLimiter({
    windowMs: config.rateLimits.recommendationTryItClick.windowMs,
    max: config.rateLimits.recommendationTryItClick.max,
    message: "Too many try-it click requests"
  });

  const authRateLimiter = createIpRateLimiter({
    windowMs: config.rateLimits.auth?.windowMs || 60_000,
    max: config.rateLimits.auth?.max || 10,
    message: "Too many auth requests"
  });

  const meRateLimiter = createIpRateLimiter({
    windowMs: config.rateLimits.authMe?.windowMs || 60_000,
    max: config.rateLimits.authMe?.max || 60,
    message: "Too many me requests"
  });

  const healthCheck =
    options.healthCheck ||
    (async () => {
      await queryFn("SELECT 1");
      return { status: "ok", mode: "database" };
    });

  const app = express();

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true
    })
  );

  app.use(express.json());
  app.use(sessionParser);

  app.use("/api", createHealthRouter({ healthCheck }));
  app.use(
    "/api/auth",
    createAuthRouter({
      authService,
      cookieName: sessionCookieName,
      sessionTtlMs,
      isProduction: config.isProduction,
      requireAuth,
      authRateLimiter,
      meRateLimiter
    })
  );
  app.use("/api", createCatalogRouter({ catalogService }));
  app.use(
    "/api",
    createRecommendationRouter({
      sessionService,
      recommendationService,
      leadCaptureService,
      authService,
      sessionCookieName,
      sessionTtlMs,
      isProduction: config.isProduction,
      sessionRateLimiter,
      computeRateLimiter,
      unlockRateLimiter,
      feedbackRateLimiter,
      tryItRateLimiter
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
