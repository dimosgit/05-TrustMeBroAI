import { ConflictError, UnauthorizedError, ValidationError } from "../errors.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateSessionToken, hashSessionToken } from "../utils/sessionToken.js";
import {
  assertValidEmail,
  assertValidPassword,
  normalizeEmail,
  parseOptionalString
} from "../utils/validators.js";

function mapPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    email_consent: user.email_consent,
    consent_timestamp: user.consent_timestamp,
    signup_source: user.signup_source,
    plan: user.plan,
    subscription_status: user.subscription_status,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

export function createAuthService({ authRepository, sessionTtlMs }) {
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

  return {
    async register({ email, password, emailConsent, signupSource, userAgent, ipAddress }) {
      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);
      assertValidPassword(password);

      if (emailConsent !== true) {
        throw new ValidationError("email_consent must be true");
      }

      const safeSignupSource = parseOptionalString(signupSource);
      const existing = await authRepository.findUserByEmail(normalizedEmail);
      if (existing) {
        throw new ConflictError("Email is already registered");
      }

      const passwordHash = await hashPassword(password);
      const consentTimestamp = new Date();

      let user;
      try {
        user = await authRepository.createUser({
          email: normalizedEmail,
          passwordHash,
          emailConsent,
          consentTimestamp,
          signupSource: safeSignupSource
        });
      } catch (error) {
        if (error?.code === "23505") {
          throw new ConflictError("Email is already registered");
        }
        throw error;
      }

      const session = await createSessionForUser({
        userId: user.id,
        userAgent,
        ipAddress
      });

      return {
        user: mapPublicUser(user),
        session
      };
    },

    async login({ email, password, userAgent, ipAddress }) {
      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);
      assertValidPassword(password);

      const user = await authRepository.findUserByEmail(normalizedEmail);
      if (!user) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const passwordMatches = await verifyPassword(password, user.password_hash);
      if (!passwordMatches) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const session = await createSessionForUser({
        userId: user.id,
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
