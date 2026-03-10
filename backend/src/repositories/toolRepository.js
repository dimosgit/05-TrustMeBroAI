export function createToolRepository({ query }) {
  return {
    async getActiveToolsByCategories(categories) {
      if (!Array.isArray(categories) || categories.length === 0) {
        return [];
      }

      const result = await query(
        `SELECT
           id,
           tool_name,
           tool_slug,
           logo_url,
           best_for,
           website,
           referral_url,
           category,
           pricing,
           pricing_tier,
           ease_of_use,
           speed,
           quality,
           target_users,
           tags,
           context_word,
           record_status
         FROM tools
         WHERE record_status = 'active'
           AND category = ANY($1::text[])
         ORDER BY tool_name ASC`,
        [categories]
      );

      return result.rows;
    },

    async getAllActiveToolsExcludingCategories(categories) {
      const result = await query(
        `SELECT
           id,
           tool_name,
           tool_slug,
           logo_url,
           best_for,
           website,
           referral_url,
           category,
           pricing,
           pricing_tier,
           ease_of_use,
           speed,
           quality,
           target_users,
           tags,
           context_word,
           record_status
         FROM tools
         WHERE record_status = 'active'
           AND NOT (category = ANY($1::text[]))
         ORDER BY tool_name ASC`,
        [categories]
      );

      return result.rows;
    },

    async getToolById(toolId) {
      const result = await query(
        `SELECT
           id,
           tool_name,
           tool_slug,
           logo_url,
           best_for,
           website,
           referral_url,
           category,
           pricing,
           pricing_tier,
           ease_of_use,
           speed,
           quality,
           target_users,
           tags,
           context_word,
           record_status
         FROM tools
         WHERE id = $1
         LIMIT 1`,
        [toolId]
      );

      return result.rows[0] || null;
    },

    async getToolsByIds(toolIds) {
      if (!Array.isArray(toolIds) || toolIds.length === 0) {
        return [];
      }

      const result = await query(
        `SELECT
           id,
           tool_name,
           tool_slug,
           logo_url,
           best_for,
           website,
           referral_url,
           category,
           pricing,
           pricing_tier,
           ease_of_use,
           speed,
           quality,
           target_users,
           tags,
           context_word,
           record_status
         FROM tools
         WHERE id = ANY($1::int[])`,
        [toolIds]
      );

      return result.rows;
    }
  };
}
