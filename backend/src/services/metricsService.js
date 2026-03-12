import { ValidationError } from "../errors.js";

const ALLOWED_FUNNEL_EVENTS = new Set([
  "account_created",
  "sign_in_completed",
  "recommendation_unlocked",
  "try_it_clicked"
]);

function assertValidEventName(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError("event_name is required");
  }

  const normalized = value.trim();
  if (!ALLOWED_FUNNEL_EVENTS.has(normalized)) {
    throw new ValidationError("event_name is invalid");
  }

  return normalized;
}

export function createMetricsService({ metricsRepository, logger = console }) {
  return {
    async captureFunnelEvent({
      eventName,
      userId = null,
      sessionId = null,
      recommendationId = null,
      eventSource = "backend",
      eventMetadata = {}
    }) {
      try {
        const safeEventName = assertValidEventName(eventName);
        return await metricsRepository.createFunnelEvent({
          eventName: safeEventName,
          userId,
          sessionId,
          recommendationId,
          eventSource,
          eventMetadata
        });
      } catch (error) {
        logger.warn?.(
          `[metrics] failed to capture funnel event "${eventName}": ${error?.message || error}`
        );
        return null;
      }
    }
  };
}
