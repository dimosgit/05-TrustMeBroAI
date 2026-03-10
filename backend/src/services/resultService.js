export function createResultService() {
  return {
    buildLockedResult({ sessionId, recommendationId, primaryTool, alternativeTools }) {
      return {
        session_id: sessionId,
        recommendation_id: recommendationId,
        primary_tool: {
          tool_name: primaryTool.tool_name,
          locked: true
        },
        alternative_tools: alternativeTools.slice(0, 2).map((tool) => ({
          tool_name: tool.tool_name,
          context_word: tool.context_word || null
        }))
      };
    },

    buildUnlockedResult({ sessionId, recommendationId, primaryTool, primaryReason, unlockedAt }) {
      return {
        session_id: sessionId,
        recommendation_id: recommendationId,
        primary_tool: {
          tool_name: primaryTool.tool_name,
          tool_slug: primaryTool.tool_slug,
          logo_url: primaryTool.logo_url,
          best_for: primaryTool.best_for,
          primary_reason: primaryReason,
          try_it_url: primaryTool.referral_url || primaryTool.website,
          locked: false,
          unlocked_at: unlockedAt
        }
      };
    }
  };
}
