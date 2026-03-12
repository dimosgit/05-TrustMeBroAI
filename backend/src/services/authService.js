import { UnauthorizedError, ValidationError } from "../errors.js";
import { generateSessionToken, hashSessionToken } from "../utils/sessionToken.js";
import { assertValidEmail, normalizeEmail, parseOptionalString } from "../utils/validators.js";

const GENERIC_RECOVERY_MESSAGE = "If the email is valid, you will receive a recovery link.";

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

function normalizePasskeyTransports(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function assertValidRecoveryToken(token) {
  if (typeof token !== "string" || token.trim().length < 20 || token.length > 512) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

function normalizeRedirectPath(value) {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError("redirect_path must be a string");
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.startsWith("/")) {
    return null;
  }

  return trimmed.slice(0, 512);
}

export function createAuthService({
  authRepository,
  passkeyAdapter,
  sessionTtlMs,
  passkeyChallengeTtlMs,
  recoveryTokenTtlMs,
  sendRecoveryLink
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

  async function issuePasskeyChallenge({
    userId,
    purpose,
    userAgent,
    ipAddress,
    rpId,
    origin
  }) {
    const challenge = generateSessionToken();
    const challengeHash = hashSessionToken(challenge);
    const expiresAt = new Date(Date.now() + passkeyChallengeTtlMs);

    const row = await authRepository.createPasskeyChallenge({
      userId,
      challengeHash,
      purpose,
      rpId,
      origin,
      expiresAt,
      userAgent,
      ipAddress
    });

    return {
      id: row.id,
      challenge
    };
  }

  async function touchLoginAndLoadPublicUser({ userId, loginAt, ensureRegisteredAt }) {
    await authRepository.markUserLogin({
      userId,
      loginAt,
      ensureRegisteredAt
    });

    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError("User account is unavailable");
    }

    return user;
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

    async requestPasskeyRegistrationOptions({
      email,
      emailConsent,
      signupSource,
      userAgent,
      ipAddress
    }) {
      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);

      if (emailConsent !== true) {
        throw new ValidationError("email_consent must be true");
      }

      const safeSignupSource = parseOptionalString(signupSource);
      const now = new Date();
      const user = await authRepository.upsertUserForRegistration({
        email: normalizedEmail,
        emailConsent,
        consentTimestamp: now,
        signupSource: safeSignupSource,
        registeredAt: now
      });

      const existingPasskeys = await authRepository.findActivePasskeysByUserId(user.id);
      const challenge = await issuePasskeyChallenge({
        userId: user.id,
        purpose: "register",
        userAgent,
        ipAddress,
        rpId: passkeyAdapter.rpId,
        origin: passkeyAdapter.expectedOrigins[0] || ""
      });

      const publicKey = await passkeyAdapter.generateRegistrationOptions({
        challenge: challenge.challenge,
        user: {
          id: String(user.id),
          email: user.email
        },
        excludeCredentialIds: existingPasskeys.map((row) => row.credential_id)
      });

      return {
        challenge_id: challenge.id,
        public_key: publicKey
      };
    },

    async verifyPasskeyRegistration({
      challengeId,
      credential,
      userAgent,
      ipAddress
    }) {
      if (!Number.isInteger(challengeId) || challengeId <= 0) {
        throw new ValidationError("challenge_id must be a positive integer");
      }

      if (!credential || typeof credential !== "object") {
        throw new ValidationError("credential payload is required");
      }

      const challenge = await authRepository.consumePasskeyChallengeById({
        challengeId,
        purpose: "register"
      });

      if (!challenge) {
        throw new UnauthorizedError("Invalid or expired challenge");
      }

      if (!challenge.user_id) {
        throw new UnauthorizedError("Invalid challenge scope");
      }

      const verification = await passkeyAdapter.verifyRegistrationCredential({
        credential,
        expectedChallenge: async (candidateChallenge) =>
          hashSessionToken(candidateChallenge) === challenge.challenge_hash
      });

      if (!verification.verified || !verification.registration) {
        throw new UnauthorizedError("Passkey verification failed");
      }

      const existingPasskey = await authRepository.findPasskeyByCredentialId(
        verification.registration.credentialId
      );

      if (existingPasskey && Number(existingPasskey.user_id) !== Number(challenge.user_id)) {
        throw new UnauthorizedError("Credential is already linked to another account");
      }

      await authRepository.upsertPasskeyCredential({
        userId: challenge.user_id,
        credentialId: verification.registration.credentialId,
        publicKey: verification.registration.publicKey,
        counter: verification.registration.counter,
        transports: normalizePasskeyTransports(verification.registration.transports),
        aaguid: verification.registration.aaguid,
        deviceName: parseOptionalString(credential?.device_name, 120)
      });

      const user = await touchLoginAndLoadPublicUser({
        userId: challenge.user_id,
        loginAt: new Date(),
        ensureRegisteredAt: true
      });

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

    async requestPasskeyAuthenticationOptions({
      email,
      userAgent,
      ipAddress
    }) {
      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);

      const user = await authRepository.findUserByEmail(normalizedEmail);
      const userId = user?.id || null;
      const passkeys = userId
        ? await authRepository.findActivePasskeysByUserId(userId)
        : [];

      const challenge = await issuePasskeyChallenge({
        userId,
        purpose: "authenticate",
        userAgent,
        ipAddress,
        rpId: passkeyAdapter.rpId,
        origin: passkeyAdapter.expectedOrigins[0] || ""
      });

      const publicKey = await passkeyAdapter.generateAuthenticationOptions({
        challenge: challenge.challenge,
        allowCredentialIds: passkeys.map((row) => row.credential_id)
      });

      return {
        challenge_id: challenge.id,
        public_key: publicKey
      };
    },

    async verifyPasskeyAuthentication({
      challengeId,
      credential,
      userAgent,
      ipAddress
    }) {
      if (!Number.isInteger(challengeId) || challengeId <= 0) {
        throw new ValidationError("challenge_id must be a positive integer");
      }

      if (!credential || typeof credential !== "object") {
        throw new ValidationError("credential payload is required");
      }

      const challenge = await authRepository.consumePasskeyChallengeById({
        challengeId,
        purpose: "authenticate"
      });

      if (!challenge) {
        throw new UnauthorizedError("Invalid or expired challenge");
      }

      if (typeof credential.id !== "string" || !credential.id.trim()) {
        throw new UnauthorizedError("Invalid credential");
      }

      const passkey = await authRepository.findPasskeyByCredentialId(credential.id.trim());
      if (!passkey || passkey.revoked_at) {
        throw new UnauthorizedError("Invalid credential");
      }

      if (challenge.user_id && Number(challenge.user_id) !== Number(passkey.user_id)) {
        throw new UnauthorizedError("Credential does not match challenge scope");
      }

      const verification = await passkeyAdapter.verifyAuthenticationCredential({
        credential,
        expectedChallenge: async (candidateChallenge) =>
          hashSessionToken(candidateChallenge) === challenge.challenge_hash,
        passkey
      });

      if (!verification.verified || !verification.authentication) {
        throw new UnauthorizedError("Passkey verification failed");
      }

      await authRepository.markPasskeyUsed({
        passkeyId: passkey.id,
        counter: verification.authentication.newCounter,
        usedAt: new Date()
      });

      const user = await touchLoginAndLoadPublicUser({
        userId: passkey.user_id,
        loginAt: new Date(),
        ensureRegisteredAt: true
      });

      const session = await createSessionForUser({
        userId: passkey.user_id,
        userAgent,
        ipAddress
      });

      return {
        user: mapPublicUser(user),
        session
      };
    },

    async requestRecovery({ email, redirectPath, userAgent, ipAddress }) {
      const normalizedEmail = normalizeEmail(email);
      assertValidEmail(normalizedEmail);

      const user = await authRepository.findUserByEmail(normalizedEmail);
      if (user) {
        const token = generateSessionToken();
        const tokenHash = hashSessionToken(token);
        const expiresAt = new Date(Date.now() + recoveryTokenTtlMs);

        await authRepository.createRecoveryToken({
          userId: user.id,
          tokenHash,
          purpose: "recovery",
          expiresAt,
          redirectPath: normalizeRedirectPath(redirectPath),
          userAgent,
          ipAddress
        });

        if (sendRecoveryLink) {
          await sendRecoveryLink({
            email: user.email,
            token,
            expiresAt,
            flow: "recovery"
          });
        }
      }

      return {
        message: GENERIC_RECOVERY_MESSAGE
      };
    },

    async verifyRecovery({ token, userAgent, ipAddress }) {
      assertValidRecoveryToken(token);

      const tokenHash = hashSessionToken(token);
      const recoveryToken = await authRepository.consumeRecoveryTokenByTokenHash(tokenHash);

      if (!recoveryToken) {
        throw new UnauthorizedError("Invalid or expired token");
      }

      const user = await touchLoginAndLoadPublicUser({
        userId: recoveryToken.user_id,
        loginAt: new Date(),
        ensureRegisteredAt: true
      });

      const session = await createSessionForUser({
        userId: recoveryToken.user_id,
        userAgent,
        ipAddress
      });

      const passkeys = await authRepository.findActivePasskeysByUserId(recoveryToken.user_id);

      return {
        user: mapPublicUser(user),
        requires_passkey_enrollment: passkeys.length === 0,
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
