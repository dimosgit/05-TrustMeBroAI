import { apiClient } from "./client";

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

export async function unlockRecommendation({ sessionId, recommendationId, email, emailConsent }) {
  return apiClient.post("/recommendation/unlock", {
    session_id: sessionId,
    recommendation_id: recommendationId,
    email,
    email_consent: emailConsent,
    signup_source: "landing"
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
