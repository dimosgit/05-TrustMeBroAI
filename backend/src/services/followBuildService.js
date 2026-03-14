import { ValidationError } from "../errors.js";
import { assertValidEmail, normalizeEmail } from "../utils/validators.js";

export const FOLLOW_THE_BUILD_SIGNUP_SOURCE = "follow_the_build";

export function createFollowBuildService({ userRepository }) {
  return {
    async captureEmail({ email, emailConsent }) {
      if (emailConsent !== true) {
        throw new ValidationError("email_consent must be true");
      }

      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);

      const existingUser = await userRepository.findUserByEmail(normalizedEmail);
      const signupSource = existingUser?.signup_source || FOLLOW_THE_BUILD_SIGNUP_SOURCE;

      const user = await userRepository.upsertUser({
        email: normalizedEmail,
        emailConsent: true,
        consentTimestamp: new Date(),
        signupSource
      });

      return {
        created: !existingUser,
        user
      };
    }
  };
}
