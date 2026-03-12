export function createAuthRepository({ query }) {
  return {
    async findUserByEmail(email) {
      const result = await query(
        `SELECT
           id,
           email,
           email_consent,
           consent_timestamp,
           signup_source,
           registered_at,
           last_login_at,
           plan,
           subscription_status,
           created_at,
           updated_at
         FROM users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email]
      );

      return result.rows[0] || null;
    },

    async findUserById(userId) {
      const result = await query(
        `SELECT
           id,
           email,
           email_consent,
           consent_timestamp,
           signup_source,
           registered_at,
           last_login_at,
           plan,
           subscription_status,
           created_at,
           updated_at
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [userId]
      );

      return result.rows[0] || null;
    },

    async upsertUserForRegistration({
      email,
      emailConsent,
      consentTimestamp,
      signupSource,
      registeredAt
    }) {
      const result = await query(
        `INSERT INTO users (
           email,
           email_consent,
           consent_timestamp,
           signup_source,
           registered_at
         )
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT ((LOWER(email)))
         DO UPDATE SET
           email_consent = EXCLUDED.email_consent,
           consent_timestamp = EXCLUDED.consent_timestamp,
           signup_source = COALESCE(EXCLUDED.signup_source, users.signup_source),
           registered_at = COALESCE(users.registered_at, EXCLUDED.registered_at),
           updated_at = NOW()
         RETURNING
           id,
           email,
           email_consent,
           consent_timestamp,
           signup_source,
           registered_at,
           last_login_at,
           plan,
           subscription_status,
           created_at,
           updated_at`,
        [email, emailConsent, consentTimestamp, signupSource, registeredAt]
      );

      return result.rows[0];
    },

    async markUserLogin({ userId, loginAt, ensureRegisteredAt = false }) {
      const result = await query(
        `UPDATE users
         SET last_login_at = $2,
             registered_at = CASE
               WHEN $3::boolean IS TRUE THEN COALESCE(registered_at, $2)
               ELSE registered_at
             END,
             updated_at = NOW()
         WHERE id = $1
         RETURNING
           id,
           email,
           email_consent,
           consent_timestamp,
           signup_source,
           registered_at,
           last_login_at,
           plan,
           subscription_status,
           created_at,
           updated_at`,
        [userId, loginAt, ensureRegisteredAt]
      );

      return result.rows[0] || null;
    },

    async createPasskeyChallenge({
      userId,
      challengeHash,
      purpose,
      rpId,
      origin,
      expiresAt,
      userAgent,
      ipAddress
    }) {
      const result = await query(
        `INSERT INTO auth_passkey_challenges (
           user_id,
           challenge_hash,
           purpose,
           rp_id,
           origin,
           expires_at,
           user_agent,
           ip_address
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, user_id, challenge_hash, purpose, expires_at, created_at`,
        [userId, challengeHash, purpose, rpId, origin, expiresAt, userAgent, ipAddress]
      );

      return result.rows[0];
    },

    async consumePasskeyChallengeById({ challengeId, purpose }) {
      const result = await query(
        `UPDATE auth_passkey_challenges
         SET used_at = NOW()
         WHERE id = $1
           AND purpose = $2
           AND used_at IS NULL
           AND expires_at > NOW()
         RETURNING
           id,
           user_id,
           challenge_hash,
           purpose,
           rp_id,
           origin,
           expires_at,
           used_at,
           created_at`,
        [challengeId, purpose]
      );

      return result.rows[0] || null;
    },

    async findActivePasskeysByUserId(userId) {
      const result = await query(
        `SELECT
           id,
           user_id,
           credential_id,
           public_key,
           counter,
           transports,
           aaguid,
           device_name,
           created_at,
           updated_at,
           last_used_at,
           revoked_at
         FROM auth_passkeys
         WHERE user_id = $1
           AND revoked_at IS NULL
         ORDER BY created_at ASC`,
        [userId]
      );

      return result.rows;
    },

    async findPasskeyByCredentialId(credentialId) {
      const result = await query(
        `SELECT
           id,
           user_id,
           credential_id,
           public_key,
           counter,
           transports,
           aaguid,
           device_name,
           created_at,
           updated_at,
           last_used_at,
           revoked_at
         FROM auth_passkeys
         WHERE credential_id = $1
         LIMIT 1`,
        [credentialId]
      );

      return result.rows[0] || null;
    },

    async upsertPasskeyCredential({
      userId,
      credentialId,
      publicKey,
      counter,
      transports,
      aaguid,
      deviceName
    }) {
      const result = await query(
        `INSERT INTO auth_passkeys (
           user_id,
           credential_id,
           public_key,
           counter,
           transports,
           aaguid,
           device_name,
           last_used_at
         )
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, NOW())
         ON CONFLICT (credential_id)
         DO UPDATE SET
           user_id = EXCLUDED.user_id,
           public_key = EXCLUDED.public_key,
           counter = GREATEST(auth_passkeys.counter, EXCLUDED.counter),
           transports = EXCLUDED.transports,
           aaguid = COALESCE(EXCLUDED.aaguid, auth_passkeys.aaguid),
           device_name = COALESCE(EXCLUDED.device_name, auth_passkeys.device_name),
           last_used_at = NOW(),
           updated_at = NOW(),
           revoked_at = NULL
         RETURNING
           id,
           user_id,
           credential_id,
           public_key,
           counter,
           transports,
           aaguid,
           device_name,
           created_at,
           updated_at,
           last_used_at,
           revoked_at`,
        [userId, credentialId, publicKey, counter, JSON.stringify(transports || []), aaguid, deviceName]
      );

      return result.rows[0];
    },

    async markPasskeyUsed({ passkeyId, counter, usedAt }) {
      const result = await query(
        `UPDATE auth_passkeys
         SET counter = GREATEST(counter, $2),
             last_used_at = $3,
             updated_at = NOW()
         WHERE id = $1
         RETURNING
           id,
           user_id,
           credential_id,
           public_key,
           counter,
           transports,
           aaguid,
           device_name,
           created_at,
           updated_at,
           last_used_at,
           revoked_at`,
        [passkeyId, counter, usedAt]
      );

      return result.rows[0] || null;
    },

    async createRecoveryToken({
      userId,
      tokenHash,
      purpose,
      expiresAt,
      redirectPath,
      userAgent,
      ipAddress
    }) {
      const result = await query(
        `INSERT INTO auth_recovery_tokens (
           user_id,
           token_hash,
           purpose,
           expires_at,
           redirect_path,
           user_agent,
           ip_address
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, user_id, purpose, expires_at, created_at`,
        [userId, tokenHash, purpose, expiresAt, redirectPath, userAgent, ipAddress]
      );

      return result.rows[0];
    },

    async consumeRecoveryTokenByTokenHash(tokenHash) {
      const result = await query(
        `UPDATE auth_recovery_tokens
         SET used_at = NOW()
         WHERE token_hash = $1
           AND used_at IS NULL
           AND expires_at > NOW()
         RETURNING id, user_id, purpose, expires_at, used_at, created_at`,
        [tokenHash]
      );

      return result.rows[0] || null;
    },

    async createAuthSession({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
      const result = await query(
        `INSERT INTO auth_sessions (user_id, token_hash, expires_at, user_agent, ip_address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, expires_at, created_at`,
        [userId, tokenHash, expiresAt, userAgent, ipAddress]
      );

      return result.rows[0];
    },

    async findActiveSessionByTokenHash(tokenHash) {
      const result = await query(
        `SELECT
           s.id AS session_id,
           s.user_id,
           s.expires_at,
           s.created_at AS session_created_at,
           u.id,
           u.email,
           u.email_consent,
           u.consent_timestamp,
           u.signup_source,
           u.registered_at,
           u.last_login_at,
           u.plan,
           u.subscription_status,
           u.created_at,
           u.updated_at
         FROM auth_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1
           AND s.revoked_at IS NULL
           AND s.expires_at > NOW()
         LIMIT 1`,
        [tokenHash]
      );

      return result.rows[0] || null;
    },

    async touchAuthSession(sessionId) {
      await query(
        `UPDATE auth_sessions
         SET last_used_at = NOW()
         WHERE id = $1`,
        [sessionId]
      );
    },

    async revokeAuthSessionById(sessionId) {
      await query(
        `UPDATE auth_sessions
         SET revoked_at = NOW()
         WHERE id = $1
           AND revoked_at IS NULL`,
        [sessionId]
      );
    },

    async revokeAuthSessionByTokenHash(tokenHash) {
      await query(
        `UPDATE auth_sessions
         SET revoked_at = NOW()
         WHERE token_hash = $1
           AND revoked_at IS NULL`,
        [tokenHash]
      );
    }
  };
}
