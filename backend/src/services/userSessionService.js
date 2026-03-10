import { assertPositiveInteger, assertString, assertStringArray } from "../utils/validators.js";

export function createUserSessionService({ userSessionRepository }) {
  return {
    async createUserSession({ userId, profileId, taskId, budget, experienceLevel, selectedPriorities }) {
      const parsedProfileId = assertPositiveInteger(profileId, "profile_id");
      const parsedTaskId = assertPositiveInteger(taskId, "task_id");
      const normalizedBudget = assertString(budget, "budget", 50);
      const normalizedExperienceLevel = assertString(experienceLevel, "experience_level", 50);
      const normalizedPriorities = assertStringArray(
        selectedPriorities || [],
        "selected_priorities"
      );

      return userSessionRepository.createUserSession({
        userId,
        profileId: parsedProfileId,
        taskId: parsedTaskId,
        budget: normalizedBudget,
        experienceLevel: normalizedExperienceLevel,
        selectedPriorities: normalizedPriorities
      });
    }
  };
}
