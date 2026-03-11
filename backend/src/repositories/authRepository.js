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

    async findRegisteredUserByEmail(email) {
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
           AND registered_at IS NOT NULL
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

    async markUserLogin({ userId, loginAt }) {
      const result = await query(
        `UPDATE users
         SET last_login_at = $2,
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
        [userId, loginAt]
      );

      return result.rows[0] || null;
    },

    async createMagicLinkChallenge({ userId, tokenHash, expiresAt, userAgent, ipAddress, flow }) {
      const result = await query(
        `INSERT INTO auth_magic_links (user_id, token_hash, expires_at, user_agent, ip_address, flow)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, expires_at, created_at`,
        [userId, tokenHash, expiresAt, userAgent, ipAddress, flow]
      );

      return result.rows[0];
    },

    async consumeMagicLinkChallengeByTokenHash(tokenHash) {
      const result = await query(
        `UPDATE auth_magic_links
         SET used_at = NOW()
         WHERE token_hash = $1
           AND used_at IS NULL
           AND expires_at > NOW()
         RETURNING id, user_id, expires_at, created_at, used_at`,
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
