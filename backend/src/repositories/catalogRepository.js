export function createCatalogRepository({ query }) {
  return {
    async getProfiles() {
      const result = await query("SELECT id, name, description FROM profiles ORDER BY id ASC");
      return result.rows;
    },

    async getTasks() {
      const result = await query("SELECT id, name, description, category FROM tasks ORDER BY id ASC");
      return result.rows;
    },

    async getPriorities() {
      const result = await query("SELECT id, name, description FROM priorities ORDER BY id ASC");
      return result.rows;
    },

    async getTaskById(taskId) {
      const result = await query(
        "SELECT id, name, description, category FROM tasks WHERE id = $1 LIMIT 1",
        [taskId]
      );
      return result.rows[0] || null;
    },

    async getProfileById(profileId) {
      const result = await query("SELECT id, name, description FROM profiles WHERE id = $1 LIMIT 1", [
        profileId
      ]);
      return result.rows[0] || null;
    }
  };
}
