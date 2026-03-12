import { NotFoundError, ValidationError } from "../errors.js";
import {
  buildPrimaryReason,
  containsProfile,
  getFallbackCategories,
  getPricingFit,
  getPriorityTieKey,
  getWeightsForPriority,
  scoreTool
} from "../utils/scoring.js";
import { assertPositiveInteger } from "../utils/validators.js";

function parseAlternativeToolIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => Number.parseInt(entry, 10))
    .filter((entry) => Number.isInteger(entry) && entry > 0);
}

function mapHistoryItem(historyRow) {
  return {
    recommendation_id: historyRow.recommendation_id,
    session_id: historyRow.session_id,
    selected_priority: historyRow.selected_priority,
    task_name: historyRow.task_name,
    profile_name: historyRow.profile_name,
    locked: historyRow.is_primary_locked,
    primary_reason: historyRow.primary_reason,
    unlocked_at: historyRow.unlocked_at,
    created_at: historyRow.recommendation_created_at,
    try_it_clicked: historyRow.try_it_clicked,
    primary_tool: {
      id: historyRow.primary_tool_id,
      tool_name: historyRow.primary_tool_name,
      tool_slug: historyRow.primary_tool_slug,
      logo_url: historyRow.primary_tool_logo_url,
      try_it_url: historyRow.primary_tool_referral_url || historyRow.primary_tool_website
    }
  };
}

function annotateTool(tool, weights) {
  const quality = Number(tool.quality);
  const speed = Number(tool.speed);
  const easeOfUse = Number(tool.ease_of_use);
  const pricingFit = getPricingFit(tool.pricing_tier);

  const enriched = {
    ...tool,
    quality,
    speed,
    ease_of_use: easeOfUse,
    pricing_fit: pricingFit
  };

  return {
    ...enriched,
    score: Number(scoreTool(enriched, weights).toFixed(6))
  };
}

function compareTools(a, b, tieKey, profileName) {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  const aTie = Number(a[tieKey] || 0);
  const bTie = Number(b[tieKey] || 0);
  if (bTie !== aTie) {
    return bTie - aTie;
  }

  const aProfileMatch = containsProfile(a.target_users, profileName) ? 1 : 0;
  const bProfileMatch = containsProfile(b.target_users, profileName) ? 1 : 0;
  if (bProfileMatch !== aProfileMatch) {
    return bProfileMatch - aProfileMatch;
  }

  return a.tool_name.localeCompare(b.tool_name);
}

function pickTopThree({ tools, primaryCategory, fallbackCategories, tieKey, profileName }) {
  const categoryOrder = [primaryCategory, ...fallbackCategories];
  const byCategory = new Map();

  for (const tool of tools) {
    const collection = byCategory.get(tool.category) || [];
    collection.push(tool);
    byCategory.set(tool.category, collection);
  }

  const selected = [];
  const selectedIds = new Set();

  for (const category of categoryOrder) {
    const toolsInCategory = (byCategory.get(category) || []).sort((a, b) =>
      compareTools(a, b, tieKey, profileName)
    );

    for (const tool of toolsInCategory) {
      if (selected.length >= 3) {
        break;
      }
      if (selectedIds.has(tool.id)) {
        continue;
      }
      selected.push(tool);
      selectedIds.add(tool.id);
    }
  }

  return {
    selected,
    selectedIds,
    orderedCategories: categoryOrder
  };
}

export function createRecommendationService({
  sessionRepository,
  recommendationRepository,
  toolRepository,
  resultService
}) {
  async function buildResultFromRecommendation(recommendationRow) {
    const primaryTool = await toolRepository.getToolById(recommendationRow.primary_tool_id);
    if (!primaryTool) {
      throw new NotFoundError("Primary tool not found");
    }

    const alternativeIds = parseAlternativeToolIds(recommendationRow.alternative_tool_ids);
    const alternativeTools = await toolRepository.getToolsByIds(alternativeIds);
    const byId = new Map(alternativeTools.map((tool) => [tool.id, tool]));
    const orderedAlternatives = alternativeIds.map((id) => byId.get(id)).filter(Boolean).slice(0, 2);

    if (recommendationRow.is_primary_locked) {
      return resultService.buildLockedResult({
        sessionId: recommendationRow.session_id,
        recommendationId: recommendationRow.id,
        primaryTool,
        alternativeTools: orderedAlternatives
      });
    }

    return resultService.buildUnlockedResult({
      sessionId: recommendationRow.session_id,
      recommendationId: recommendationRow.id,
      primaryTool,
      primaryReason: recommendationRow.primary_reason,
      unlockedAt: recommendationRow.unlocked_at
    });
  }

  return {
    async computeForSession({ sessionId }) {
      const parsedSessionId = assertPositiveInteger(sessionId, "session_id");
      const session = await sessionRepository.getSessionById(parsedSessionId);
      if (!session) {
        throw new NotFoundError("Session not found");
      }

      const existingRecommendation = await recommendationRepository.findRecommendationBySessionId(
        parsedSessionId
      );
      if (existingRecommendation) {
        return buildResultFromRecommendation(existingRecommendation);
      }

      const weights = getWeightsForPriority(session.selected_priority);
      const tieKey = getPriorityTieKey(session.selected_priority);
      const fallbackCategories = getFallbackCategories(session.task_category);
      const orderedCategories = [session.task_category, ...fallbackCategories];

      const categoryToolsRaw = await toolRepository.getActiveToolsByCategories(orderedCategories);
      const categoryTools = categoryToolsRaw.map((tool) => annotateTool(tool, weights));

      const categoryPick = pickTopThree({
        tools: categoryTools,
        primaryCategory: session.task_category,
        fallbackCategories,
        tieKey,
        profileName: session.profile_name
      });

      let selectedTools = categoryPick.selected;

      if (selectedTools.length < 3) {
        const remainingToolsRaw = await toolRepository.getAllActiveToolsExcludingCategories(
          categoryPick.orderedCategories
        );
        const remainingRanked = remainingToolsRaw
          .map((tool) => annotateTool(tool, weights))
          .sort((a, b) => compareTools(a, b, tieKey, session.profile_name));

        for (const tool of remainingRanked) {
          if (selectedTools.length >= 3) {
            break;
          }
          if (categoryPick.selectedIds.has(tool.id)) {
            continue;
          }
          selectedTools.push(tool);
          categoryPick.selectedIds.add(tool.id);
        }
      }

      if (selectedTools.length < 3) {
        throw new ValidationError("Not enough active tools to compute recommendation");
      }

      selectedTools = selectedTools.slice(0, 3);
      const primaryTool = selectedTools[0];
      const alternativeTools = selectedTools.slice(1, 3);

      const primaryReason = buildPrimaryReason({
        toolName: primaryTool.tool_name,
        taskLabel: session.task_name,
        priority: session.selected_priority
      });

      const recommendationRow = await recommendationRepository.createRecommendation({
        sessionId: session.id,
        primaryToolId: primaryTool.id,
        alternativeToolIds: alternativeTools.map((tool) => tool.id),
        primaryReason
      });

      return resultService.buildLockedResult({
        sessionId: recommendationRow.session_id,
        recommendationId: recommendationRow.id,
        primaryTool,
        alternativeTools
      });
    },

    async recordFeedback({ recommendationId, signal }) {
      const parsedRecommendationId = assertPositiveInteger(recommendationId, "id");
      const parsedSignal = Number.parseInt(signal, 10);

      if (parsedSignal !== -1 && parsedSignal !== 1) {
        throw new ValidationError("signal must be either -1 or 1");
      }

      const recommendation = await recommendationRepository.findRecommendationById(parsedRecommendationId);
      if (!recommendation) {
        throw new NotFoundError("Recommendation not found");
      }

      return recommendationRepository.createFeedback({
        recommendationId: parsedRecommendationId,
        signal: parsedSignal
      });
    },

    async recordTryItClick({ recommendationId, sessionId }) {
      const parsedRecommendationId = assertPositiveInteger(recommendationId, "id");
      const parsedSessionId = assertPositiveInteger(sessionId, "session_id");

      const recommendation = await recommendationRepository.findRecommendationById(parsedRecommendationId);
      if (!recommendation) {
        throw new NotFoundError("Recommendation not found");
      }

      const recommendationSessionId = assertPositiveInteger(recommendation.session_id, "session_id");
      if (recommendationSessionId !== parsedSessionId) {
        throw new ValidationError("recommendation_id does not belong to session_id");
      }

      if (recommendation.is_primary_locked) {
        throw new ValidationError("Recommendation must be unlocked before tracking try-it click");
      }

      return recommendationRepository.createTryItClick({
        recommendationId: parsedRecommendationId,
        sessionId: parsedSessionId
      });
    },

    async getRecommendationById(recommendationId) {
      const parsedRecommendationId = assertPositiveInteger(recommendationId, "recommendation_id");
      const recommendation = await recommendationRepository.findRecommendationById(parsedRecommendationId);
      if (!recommendation) {
        throw new NotFoundError("Recommendation not found");
      }

      return recommendation;
    },

    async buildResultFromRecommendationId(recommendationId) {
      const recommendation = await this.getRecommendationById(recommendationId);
      return buildResultFromRecommendation(recommendation);
    },

    async listHistoryForUser({ userId, limit = 20, offset = 0 }) {
      const parsedUserId = assertPositiveInteger(userId, "user_id");
      const parsedLimit = Math.min(Math.max(assertPositiveInteger(limit, "limit"), 1), 100);
      const parsedOffset = Number.parseInt(offset, 10);
      if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
        throw new ValidationError("offset must be a non-negative integer");
      }

      const rows = await recommendationRepository.listRecommendationHistoryByUserId({
        userId: parsedUserId,
        limit: parsedLimit,
        offset: parsedOffset
      });

      return rows.map(mapHistoryItem);
    },

    async getHistoryItemForUser({ userId, recommendationId }) {
      const parsedUserId = assertPositiveInteger(userId, "user_id");
      const parsedRecommendationId = assertPositiveInteger(recommendationId, "recommendation_id");

      const row = await recommendationRepository.findRecommendationHistoryByUserAndRecommendationId({
        userId: parsedUserId,
        recommendationId: parsedRecommendationId
      });

      if (!row) {
        throw new NotFoundError("Recommendation not found");
      }

      const alternativeIds = parseAlternativeToolIds(row.alternative_tool_ids);
      const alternativeTools = await toolRepository.getToolsByIds(alternativeIds);
      const byId = new Map(alternativeTools.map((tool) => [tool.id, tool]));
      const orderedAlternatives = alternativeIds
        .map((toolId) => byId.get(toolId))
        .filter(Boolean)
        .slice(0, 2)
        .map((tool) => ({
          id: tool.id,
          tool_name: tool.tool_name,
          tool_slug: tool.tool_slug,
          context_word: tool.context_word
        }));

      return {
        ...mapHistoryItem(row),
        alternative_tools: orderedAlternatives
      };
    }
  };
}
