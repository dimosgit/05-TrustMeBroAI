import { NotFoundError } from "../errors.js";

export function createCatalogService({ catalogRepository }) {
  return {
    getProfiles() {
      return catalogRepository.getProfiles();
    },

    getTasks() {
      return catalogRepository.getTasks();
    },

    getPriorities() {
      return catalogRepository.getPriorities();
    },

    async requireTask(taskId) {
      const task = await catalogRepository.getTaskById(taskId);
      if (!task) {
        throw new NotFoundError("Task not found");
      }
      return task;
    },

    async requireProfile(profileId) {
      const profile = await catalogRepository.getProfileById(profileId);
      if (!profile) {
        throw new NotFoundError("Profile not found");
      }
      return profile;
    }
  };
}
