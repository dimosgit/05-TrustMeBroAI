import {
  assertOptionalInteger,
  assertPositiveInteger,
  assertValidPriority
} from "../utils/validators.js";

export function createSessionService({ sessionRepository, catalogService }) {
  return {
    async createAnonymousSession({ profileId, taskId, selectedPriority, wizardDurationSeconds }) {
      const parsedProfileId = assertPositiveInteger(profileId, "profile_id");
      const parsedTaskId = assertPositiveInteger(taskId, "task_id");
      const parsedPriority = assertValidPriority(selectedPriority);
      const parsedDuration = assertOptionalInteger(
        wizardDurationSeconds,
        "wizard_duration_seconds"
      );

      await catalogService.requireProfile(parsedProfileId);
      await catalogService.requireTask(parsedTaskId);

      const session = await sessionRepository.createSession({
        profileId: parsedProfileId,
        taskId: parsedTaskId,
        selectedPriority: parsedPriority,
        wizardDurationSeconds: parsedDuration
      });

      return {
        session_id: session.id,
        created_at: session.created_at
      };
    }
  };
}
