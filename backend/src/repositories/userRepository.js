export function createUserRepository({ query }) {
  return {
    async upsertUser({ email, emailConsent, consentTimestamp, signupSource }) {
      const result = await query(
        `INSERT INTO users (email, email_consent, consent_timestamp, signup_source)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ((LOWER(email)))
         DO UPDATE SET
           email_consent = EXCLUDED.email_consent,
           consent_timestamp = EXCLUDED.consent_timestamp,
           signup_source = COALESCE(EXCLUDED.signup_source, users.signup_source),
           updated_at = NOW()
         RETURNING id, email, email_consent, consent_timestamp, signup_source, plan, subscription_status, created_at, updated_at`,
        [email, emailConsent, consentTimestamp, signupSource]
      );

      return result.rows[0];
    }
  };
}
