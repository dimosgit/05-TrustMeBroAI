export function createRecommendationRepository({ query }) {
  return {
    async findRecommendationBySessionId(sessionId) {
      const result = await query(
        `SELECT
           id,
           session_id,
           primary_tool_id,
           alternative_tool_ids,
           primary_reason,
           is_primary_locked,
           unlocked_at,
           created_at
         FROM recommendations
         WHERE session_id = $1
         LIMIT 1`,
        [sessionId]
      );

      return result.rows[0] || null;
    },

    async findRecommendationById(recommendationId) {
      const result = await query(
        `SELECT
           r.id,
           r.session_id,
           r.primary_tool_id,
           r.alternative_tool_ids,
           r.primary_reason,
           r.is_primary_locked,
           r.unlocked_at,
           r.created_at,
           rs.user_id,
           rs.selected_priority,
           rs.task_id,
           t.name AS task_name
         FROM recommendations r
         JOIN recommendation_sessions rs ON rs.id = r.session_id
         JOIN tasks t ON t.id = rs.task_id
         WHERE r.id = $1
         LIMIT 1`,
        [recommendationId]
      );

      return result.rows[0] || null;
    },

    async createRecommendation({ sessionId, primaryToolId, alternativeToolIds, primaryReason }) {
      const result = await query(
        `INSERT INTO recommendations (session_id, primary_tool_id, alternative_tool_ids, primary_reason, is_primary_locked)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (session_id)
         DO UPDATE SET
           primary_tool_id = EXCLUDED.primary_tool_id,
           alternative_tool_ids = EXCLUDED.alternative_tool_ids,
           primary_reason = EXCLUDED.primary_reason,
           is_primary_locked = CASE WHEN recommendations.unlocked_at IS NULL THEN TRUE ELSE FALSE END
         RETURNING id, session_id, primary_tool_id, alternative_tool_ids, primary_reason, is_primary_locked, unlocked_at, created_at`,
        [sessionId, primaryToolId, JSON.stringify(alternativeToolIds), primaryReason]
      );

      return result.rows[0];
    },

    async unlockRecommendation(recommendationId) {
      const result = await query(
        `UPDATE recommendations
         SET is_primary_locked = FALSE,
             unlocked_at = COALESCE(unlocked_at, NOW())
         WHERE id = $1
         RETURNING id, session_id, primary_tool_id, alternative_tool_ids, primary_reason, is_primary_locked, unlocked_at, created_at`,
        [recommendationId]
      );

      return result.rows[0] || null;
    },

    async createFeedback({ recommendationId, signal }) {
      const result = await query(
        `INSERT INTO recommendation_feedback (recommendation_id, signal)
         VALUES ($1, $2)
         RETURNING id, recommendation_id, signal, created_at`,
        [recommendationId, signal]
      );

      return result.rows[0];
    },

    async createTryItClick({ recommendationId, sessionId }) {
      const result = await query(
        `INSERT INTO recommendation_try_it_clicks (recommendation_id, session_id)
         VALUES ($1, $2)
         ON CONFLICT (recommendation_id, session_id)
         DO UPDATE SET recommendation_id = EXCLUDED.recommendation_id
         RETURNING id, recommendation_id, session_id, created_at`,
        [recommendationId, sessionId]
      );

      return result.rows[0];
    }
  };
}
