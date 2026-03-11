import { UnauthorizedError, ValidationError } from "../errors.js";
import { generateSessionToken, hashSessionToken } from "../utils/sessionToken.js";
import { assertValidEmail, normalizeEmail, parseOptionalString } from "../utils/validators.js";

const GENERIC_MAGIC_LINK_MESSAGE = "If the email is valid, you will receive a link.";

function mapPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    email_consent: user.email_consent,
    consent_timestamp: user.consent_timestamp,
    signup_source: user.signup_source,
    registered_at: user.registered_at,
    last_login_at: user.last_login_at,
    plan: user.plan,
    subscription_status: user.subscription_status,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

function assertValidMagicToken(token) {
  if (typeof token !== "string" || token.trim().length < 20 || token.length > 512) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function createAuthService({
  authRepository,
  sessionTtlMs,
  magicLinkTtlMs,
  sendMagicLink,
  onMagicLinkIssued
}) {
  async function createSessionForUser({ userId, userAgent, ipAddress }) {
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + sessionTtlMs);

    await authRepository.createAuthSession({
      userId,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress
    });

    return {
      token,
      expiresAt
    };
  }

  async function issueMagicLink({ user, flow, userAgent, ipAddress }) {
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + magicLinkTtlMs);

    await authRepository.createMagicLinkChallenge({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
      flow
    });

    if (sendMagicLink) {
      await sendMagicLink({
        email: user.email,
        token,
        expiresAt,
        flow
      });
    }

    if (onMagicLinkIssued) {
      await onMagicLinkIssued({
        userId: user.id,
        email: user.email,
        token,
        expiresAt,
        flow
      });
    }
  }

  return {
    async issueSessionForUser({ userId, userAgent, ipAddress }) {
      if (!Number.isInteger(userId) || userId <= 0) {
        throw new ValidationError("user_id must be a positive integer");
      }

      return createSessionForUser({
        userId,
        userAgent,
        ipAddress
      });
    },

    async register({ email, emailConsent, signupSource, userAgent, ipAddress }) {
      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);

      if (emailConsent !== true) {
        throw new ValidationError("email_consent must be true");
      }

      const safeSignupSource = parseOptionalString(signupSource);
      const consentTimestamp = new Date();
      const registrationTimestamp = new Date();

      const user = await authRepository.upsertUserForRegistration({
        email: normalizedEmail,
        emailConsent,
        consentTimestamp,
        signupSource: safeSignupSource,
        registeredAt: registrationTimestamp
      });

      await issueMagicLink({
        user,
        flow: "register",
        userAgent,
        ipAddress
      });

      return {
        message: GENERIC_MAGIC_LINK_MESSAGE
      };
    },

    async requestLogin({ email, userAgent, ipAddress }) {
      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);

      const user = await authRepository.findRegisteredUserByEmail(normalizedEmail);

      if (user) {
        await issueMagicLink({
          user,
          flow: "login",
          userAgent,
          ipAddress
        });
      }

      return {
        message: GENERIC_MAGIC_LINK_MESSAGE
      };
    },

    async verifyLogin({ token, userAgent, ipAddress }) {
      assertValidMagicToken(token);

      const tokenHash = hashSessionToken(token);
      const challenge = await authRepository.consumeMagicLinkChallengeByTokenHash(tokenHash);

      if (!challenge) {
        throw new UnauthorizedError("Invalid or expired token");
      }

      const loginTimestamp = new Date();
      await authRepository.markUserLogin({
        userId: challenge.user_id,
        loginAt: loginTimestamp
      });

      const user = await authRepository.findUserById(challenge.user_id);
      if (!user) {
        throw new UnauthorizedError("Invalid or expired token");
      }

      const session = await createSessionForUser({
        userId: challenge.user_id,
        userAgent,
        ipAddress
      });

      return {
        user: mapPublicUser(user),
        session
      };
    },

    async authenticateSessionToken(token) {
      if (!token) {
        return null;
      }

      const tokenHash = hashSessionToken(token);
      const authRow = await authRepository.findActiveSessionByTokenHash(tokenHash);

      if (!authRow) {
        return null;
      }

      await authRepository.touchAuthSession(authRow.session_id);

      return {
        user: mapPublicUser(authRow),
        session: {
          id: authRow.session_id,
          user_id: authRow.user_id,
          expires_at: authRow.expires_at,
          created_at: authRow.session_created_at
        }
      };
    },

    async logoutBySessionId(sessionId) {
      if (!sessionId) {
        return;
      }

      await authRepository.revokeAuthSessionById(sessionId);
    },

    async logoutByToken(token) {
      if (!token) {
        return;
      }

      const tokenHash = hashSessionToken(token);
      await authRepository.revokeAuthSessionByTokenHash(tokenHash);
    },

    async getUserById(userId) {
      const user = await authRepository.findUserById(userId);
      return user ? mapPublicUser(user) : null;
    }
  };
}
