function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export function loadRuntimeConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const defaultFrontendOrigins = ["http://localhost:5174", "http://127.0.0.1:5174"];

  const allowedOrigins = (env.FRONTEND_ORIGIN || defaultFrontendOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    nodeEnv,
    isProduction: nodeEnv === "production",
    port: parsePositiveInt(env.PORT, 8080),
    databaseUrl: env.DATABASE_URL || "",
    allowedOrigins,
    auth: {
      magicLinkTtlMs: parsePositiveInt(env.AUTH_MAGIC_LINK_TTL_MS, 1000 * 60 * 15),
      magicLinkBaseUrl: env.AUTH_MAGIC_LINK_BASE_URL || "http://localhost:5174/auth/verify",
      magicLinkProvider: (env.AUTH_MAGIC_LINK_PROVIDER || "console").trim().toLowerCase(),
      magicLinkResendApiKey: env.AUTH_MAGIC_LINK_RESEND_API_KEY || "",
      magicLinkFromEmail: env.AUTH_MAGIC_LINK_FROM_EMAIL || "",
      magicLinkFromName: env.AUTH_MAGIC_LINK_FROM_NAME || "TrustMeBroAI"
    },
    session: {
      cookieName: env.SESSION_COOKIE_NAME || "tmb_session",
      ttlMs: parsePositiveInt(env.AUTH_SESSION_TTL_MS, 1000 * 60 * 60 * 24 * 30)
    },
    rateLimits: {
      auth: {
        windowMs: parsePositiveInt(env.RATE_LIMIT_AUTH_WINDOW_MS, 60_000),
        max: parsePositiveInt(env.RATE_LIMIT_AUTH_MAX, 10)
      },
      authMe: {
        windowMs: parsePositiveInt(env.RATE_LIMIT_AUTH_ME_WINDOW_MS, 60_000),
        max: parsePositiveInt(env.RATE_LIMIT_AUTH_ME_MAX, 60)
      },
      recommendationSession: {
        windowMs: parsePositiveInt(env.RATE_LIMIT_SESSION_WINDOW_MS, 60_000),
        max: parsePositiveInt(env.RATE_LIMIT_SESSION_MAX, 30)
      },
      recommendationCompute: {
        windowMs: parsePositiveInt(env.RATE_LIMIT_COMPUTE_WINDOW_MS, 60_000),
        max: parsePositiveInt(env.RATE_LIMIT_COMPUTE_MAX, 20)
      },
      recommendationUnlock: {
        windowMs: parsePositiveInt(env.RATE_LIMIT_UNLOCK_WINDOW_MS, 60_000),
        max: parsePositiveInt(env.RATE_LIMIT_UNLOCK_MAX, 10)
      },
      recommendationFeedback: {
        windowMs: parsePositiveInt(env.RATE_LIMIT_FEEDBACK_WINDOW_MS, 60_000),
        max: parsePositiveInt(env.RATE_LIMIT_FEEDBACK_MAX, 30)
      },
      recommendationTryItClick: {
        windowMs: parsePositiveInt(env.RATE_LIMIT_TRY_IT_WINDOW_MS, 60_000),
        max: parsePositiveInt(env.RATE_LIMIT_TRY_IT_MAX, 30)
      }
    }
  };
}
