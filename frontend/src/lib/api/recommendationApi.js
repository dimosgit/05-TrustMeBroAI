import { apiClient } from "./client";

const DEFAULT_UNLOCK_TIMEOUT_MS = 10_000;

function resolveUnlockTimeoutMs(timeoutMs) {
  if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
    return timeoutMs;
  }

  const envTimeout = Number(import.meta.env.VITE_UNLOCK_TIMEOUT_MS);
  if (Number.isFinite(envTimeout) && envTimeout > 0) {
    return envTimeout;
  }

  return DEFAULT_UNLOCK_TIMEOUT_MS;
}

function normalizeAlternative(tool) {
  return {
    toolName: tool?.tool_name || tool?.name || "",
    contextWord: tool?.context_word || ""
  };
}

function normalizePrimaryTool(tool) {
  return {
    toolName: tool?.tool_name || tool?.name || "",
    logoUrl: tool?.logo_url || "",
    bestFor: tool?.best_for || "",
    tryItUrl: tool?.try_it_url || "",
    website: tool?.website || tool?.website_url || "",
    referralUrl: tool?.referral_url || ""
  };
}

function normalizeHistoryItem(item) {
  const recommendation = item?.recommendation || item;
  const primaryTool = recommendation?.primary_tool || item?.primary_tool;

  return {
    sessionId: recommendation?.session_id || item?.session_id || item?.id || null,
    recommendationId: recommendation?.recommendation_id || recommendation?.id || item?.recommendation_id || null,
    createdAt:
      recommendation?.created_at ||
      recommendation?.createdAt ||
      item?.created_at ||
      item?.createdAt ||
      null,
    selectedPriority:
      item?.selected_priority ||
      item?.selectedPriority ||
      recommendation?.selected_priority ||
      recommendation?.selectedPriority ||
      "",
    primaryTool: normalizePrimaryTool(primaryTool),
    primaryReason:
      recommendation?.primary_reason ||
      recommendation?.primaryReason ||
      item?.primary_reason ||
      "",
    alternatives: (Array.isArray(recommendation?.alternative_tools) ? recommendation.alternative_tools : [])
      .map(normalizeAlternative)
      .filter((tool) => Boolean(tool.toolName))
      .slice(0, 2),
    unlocked: recommendation?.is_primary_locked === false || item?.is_primary_locked === false
  };
}

export function normalizeLockedResult(payload, fallbackSessionId) {
  return {
    sessionId: payload?.session_id || payload?.sessionId || fallbackSessionId || null,
    recommendationId: payload?.recommendation_id || payload?.id || null,
    primaryTool: normalizePrimaryTool(payload?.primary_tool),
    primaryReason: payload?.primary_reason || "",
    alternatives: (Array.isArray(payload?.alternative_tools) ? payload.alternative_tools : [])
      .map(normalizeAlternative)
      .filter((tool) => Boolean(tool.toolName))
      .slice(0, 2),
    unlocked: false
  };
}

export function normalizeUnlockedResult(payload, lockedState) {
  const safeLockedState = lockedState || {};
  const payloadPrimaryTool = payload?.primary_tool || payload?.recommendation?.primary_tool;
  const payloadTryItUrl = payload?.try_it_url || payload?.recommendation?.try_it_url || "";

  const normalizedPrimaryTool = normalizePrimaryTool(payloadPrimaryTool);

  return {
    ...safeLockedState,
    sessionId: payload?.session_id || payload?.recommendation?.session_id || safeLockedState.sessionId || null,
    recommendationId:
      payload?.recommendation_id ||
      payload?.recommendation?.id ||
      safeLockedState.recommendationId,
    primaryTool: {
      ...normalizedPrimaryTool,
      tryItUrl: payloadTryItUrl || normalizedPrimaryTool.tryItUrl || ""
    },
    primaryReason:
      payload?.primary_reason ||
      payload?.recommendation?.primary_reason ||
      payloadPrimaryTool?.primary_reason ||
      safeLockedState.primaryReason ||
      "",
    unlocked: true
  };
}

export async function createRecommendationSession({
  profileId,
  taskId,
  priorityName,
  wizardDurationSeconds
}) {
  const requestBody = {
    profile_id: profileId,
    task_id: taskId,
    selected_priority: priorityName,
    selected_priorities: [priorityName]
  };

  if (Number.isFinite(wizardDurationSeconds)) {
    requestBody.wizard_duration_seconds = wizardDurationSeconds;
  }

  const payload = await apiClient.post("/recommendation/session", requestBody);

  return payload?.session_id || payload?.id || null;
}

export async function computeRecommendation({ sessionId }) {
  return apiClient.post("/recommendation/compute", {
    session_id: sessionId
  });
}

export async function unlockRecommendation({
  sessionId,
  recommendationId,
  email,
  emailConsent,
  timeoutMs
}) {
  const payload = {
    session_id: sessionId,
    recommendation_id: recommendationId,
    signup_source: "landing"
  };

  if (typeof email === "string" && email.trim()) {
    payload.email = email;
  }

  if (typeof emailConsent === "boolean") {
    payload.email_consent = emailConsent;
  }

  return apiClient.post("/recommendation/unlock", payload, {
    timeoutMs: resolveUnlockTimeoutMs(timeoutMs)
  });
}

export async function submitRecommendationFeedback({ recommendationId, signal }) {
  return apiClient.post(`/recommendation/${recommendationId}/feedback`, {
    signal
  });
}

export async function submitTryItClick({ recommendationId, sessionId }) {
  return apiClient.post(`/recommendation/${recommendationId}/try-it-click`, {
    session_id: sessionId
  });
}

export async function fetchRecommendationHistory({ limit = 20 } = {}) {
  const query = Number.isInteger(limit) && limit > 0 ? `?limit=${limit}` : "";
  const payload = await apiClient.get(`/recommendation/history${query}`);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.history)
        ? payload.history
        : Array.isArray(payload?.recommendations)
          ? payload.recommendations
          : [];

  return list
    .map(normalizeHistoryItem)
    .filter((item) => Boolean(item.sessionId) && Boolean(item.primaryTool.toolName));
}
