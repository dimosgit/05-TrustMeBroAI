import { NotFoundError, ValidationError } from "../errors.js";
import { assertValidEmail, normalizeEmail, parseOptionalString } from "../utils/validators.js";

export function createLeadCaptureService({
  recommendationRepository,
  sessionRepository,
  userRepository,
  toolRepository,
  resultService
}) {
  return {
    async unlockRecommendation({ recommendationId, sessionId, email, emailConsent, signupSource }) {
      if (emailConsent !== true) {
        throw new ValidationError("email_consent must be true");
      }

      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);
      const safeSignupSource = parseOptionalString(signupSource);

      const recommendation = await recommendationRepository.findRecommendationById(recommendationId);
      if (!recommendation) {
        throw new NotFoundError("Recommendation not found");
      }
      if (recommendation.session_id !== sessionId) {
        throw new ValidationError("recommendation_id does not belong to session_id");
      }

      const user = await userRepository.upsertUser({
        email: normalizedEmail,
        emailConsent,
        consentTimestamp: new Date(),
        signupSource: safeSignupSource
      });

      await sessionRepository.linkSessionToUser({
        sessionId: recommendation.session_id,
        userId: user.id
      });

      const unlockedRecommendation = await recommendationRepository.unlockRecommendation(recommendation.id);
      if (!unlockedRecommendation) {
        throw new NotFoundError("Recommendation not found");
      }

      const primaryTool = await toolRepository.getToolById(unlockedRecommendation.primary_tool_id);
      if (!primaryTool) {
        throw new NotFoundError("Primary tool not found");
      }

      return resultService.buildUnlockedResult({
        sessionId: unlockedRecommendation.session_id,
        recommendationId: unlockedRecommendation.id,
        primaryTool,
        primaryReason: unlockedRecommendation.primary_reason,
        unlockedAt: unlockedRecommendation.unlocked_at
      });
    }
  };
}
