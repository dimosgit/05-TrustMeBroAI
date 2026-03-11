import { NotFoundError, ValidationError } from "../errors.js";
import {
  assertPositiveInteger,
  assertValidEmail,
  normalizeEmail,
  parseOptionalString
} from "../utils/validators.js";

export function createLeadCaptureService({
  recommendationRepository,
  sessionRepository,
  userRepository,
  toolRepository,
  resultService
}) {
  return {
    async unlockRecommendation({ recommendationId, sessionId, email, emailConsent, signupSource }) {
      const parsedRecommendationId = assertPositiveInteger(recommendationId, "recommendation_id");
      const parsedSessionId = assertPositiveInteger(sessionId, "session_id");

      if (emailConsent !== true) {
        throw new ValidationError("email_consent must be true");
      }

      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);
      const safeSignupSource = parseOptionalString(signupSource);

      const recommendation = await recommendationRepository.findRecommendationById(parsedRecommendationId);
      if (!recommendation) {
        throw new NotFoundError("Recommendation not found");
      }

      const recommendationSessionId = assertPositiveInteger(recommendation.session_id, "session_id");
      if (recommendationSessionId !== parsedSessionId) {
        throw new ValidationError("recommendation_id does not belong to session_id");
      }

      const user = await userRepository.upsertUser({
        email: normalizedEmail,
        emailConsent,
        consentTimestamp: new Date(),
        signupSource: safeSignupSource
      });
      const userId = assertPositiveInteger(user.id, "user_id");

      await sessionRepository.linkSessionToUser({
        sessionId: recommendationSessionId,
        userId
      });

      const unlockedRecommendation = await recommendationRepository.unlockRecommendation(
        parsedRecommendationId
      );
      if (!unlockedRecommendation) {
        throw new NotFoundError("Recommendation not found");
      }

      const unlockedSessionId = assertPositiveInteger(unlockedRecommendation.session_id, "session_id");
      const unlockedRecommendationId = assertPositiveInteger(
        unlockedRecommendation.id,
        "recommendation_id"
      );
      const primaryToolId = assertPositiveInteger(
        unlockedRecommendation.primary_tool_id,
        "primary_tool_id"
      );

      const primaryTool = await toolRepository.getToolById(primaryToolId);
      if (!primaryTool) {
        throw new NotFoundError("Primary tool not found");
      }

      const unlockedResult = resultService.buildUnlockedResult({
        sessionId: unlockedSessionId,
        recommendationId: unlockedRecommendationId,
        primaryTool,
        primaryReason: unlockedRecommendation.primary_reason,
        unlockedAt: unlockedRecommendation.unlocked_at
      });

      return {
        unlockedResult,
        user: {
          ...user,
          id: userId
        }
      };
    }
  };
}
