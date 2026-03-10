export function createSessionRepository({ query }) {
  return {
    async createSession({ profileId, taskId, selectedPriority, wizardDurationSeconds }) {
      const result = await query(
        `INSERT INTO recommendation_sessions (profile_id, task_id, selected_priority, wizard_duration_seconds)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, profile_id, task_id, selected_priority, wizard_duration_seconds, created_at`,
        [profileId, taskId, selectedPriority, wizardDurationSeconds]
      );

      return result.rows[0];
    },

    async getSessionById(sessionId) {
      const result = await query(
        `SELECT
           rs.id,
           rs.user_id,
           rs.profile_id,
           rs.task_id,
           rs.selected_priority,
           rs.wizard_duration_seconds,
           rs.created_at,
           t.name AS task_name,
           t.category AS task_category,
           p.name AS profile_name
         FROM recommendation_sessions rs
         JOIN tasks t ON t.id = rs.task_id
         JOIN profiles p ON p.id = rs.profile_id
         WHERE rs.id = $1
         LIMIT 1`,
        [sessionId]
      );

      return result.rows[0] || null;
    },

    async linkSessionToUser({ sessionId, userId }) {
      const result = await query(
        `UPDATE recommendation_sessions
         SET user_id = COALESCE(user_id, $2)
         WHERE id = $1
         RETURNING id, user_id`,
        [sessionId, userId]
      );

      return result.rows[0] || null;
    }
  };
}
