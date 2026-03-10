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
    rateLimits: {
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
