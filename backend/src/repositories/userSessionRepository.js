export function createUserSessionRepository({ query }) {
  return {
    async createUserSession({ userId, profileId, taskId, budget, experienceLevel, selectedPriorities }) {
      const result = await query(
        `INSERT INTO user_sessions (user_id, profile_id, task_id, budget, experience_level, selected_priorities)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, profile_id, task_id, budget, experience_level, selected_priorities, created_at`,
        [userId, profileId, taskId, budget, experienceLevel, JSON.stringify(selectedPriorities)]
      );

      return result.rows[0];
    },

    async findUserSessionWithTask({ userSessionId, userId }) {
      const result = await query(
        `SELECT us.id, us.user_id, us.budget, us.experience_level, us.selected_priorities, t.name AS task_name
         FROM user_sessions us
         JOIN tasks t ON t.id = us.task_id
         WHERE us.id = $1
           AND us.user_id = $2
         LIMIT 1`,
        [userSessionId, userId]
      );

      return result.rows[0] || null;
    }
  };
}
