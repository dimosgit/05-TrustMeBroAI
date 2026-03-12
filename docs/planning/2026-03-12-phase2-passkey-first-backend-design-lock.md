# Phase 2 Backend Design Lock: Passkey-First Auth with Email Fallback (2026-03-12)

Source references:
- `docs/planning/2026-03-12-authenticated-user-primary-recommendation-regression.md`
- `docs/planning/2026-03-10-post-phase1-next-action-plan.md`
- `docs/planning/final-implementation-plan.md` (immutable, not edited)

## 1. Purpose
Lock backend technical direction for Phase 2 auth without implementing runtime passkeys in this step.

Principles:
1. Email remains the account identifier.
2. Passkey (WebAuthn) becomes the primary auth method.
3. Email fallback exists for bootstrap/recovery only.
4. No password or username auth paths are introduced.

## 2. Current Contract Validation (Remembered-User Unlock)
Current backend unlock behavior is contract-stable and deterministic:
1. `POST /api/recommendation/unlock` with valid auth session and no email payload uses `req.user.email`.
2. In remembered-user mode, backend enforces:
   - `email_consent = true`
   - `signup_source = returning-user-auto-unlock` (default when not supplied)
3. Anonymous users without email still receive validation error (`400`, `A valid email is required`).
4. Existing anonymous unlock path remains unchanged.

Implication for FE fix:
- FE can safely call unlock without email when authenticated and should not rely on local-only markers.

## 3. Phase 2 Target Backend Shape

### 3.1 Data Model Additions
Add WebAuthn-focused tables (no password fields):

#### `webauthn_credentials`
- `id` BIGSERIAL PK
- `user_id` BIGINT NOT NULL FK -> `users.id`
- `credential_id` TEXT NOT NULL UNIQUE (base64url)
- `public_key` TEXT NOT NULL (COSE/serialized)
- `sign_count` BIGINT NOT NULL DEFAULT 0
- `transports` JSONB NOT NULL DEFAULT `[]`
- `aaguid` TEXT NULL
- `device_name` VARCHAR(120) NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `last_used_at` TIMESTAMP NULL
- `revoked_at` TIMESTAMP NULL

Indexes:
- unique `credential_id`
- index `(user_id, revoked_at)`

#### `webauthn_challenges`
- `id` BIGSERIAL PK
- `user_id` BIGINT NULL FK -> `users.id` (null allowed for bootstrap discovery)
- `challenge_hash` VARCHAR(64) NOT NULL UNIQUE
- `purpose` VARCHAR(32) NOT NULL (`register` | `authenticate`)
- `expires_at` TIMESTAMP NOT NULL
- `used_at` TIMESTAMP NULL
- `rp_id` VARCHAR(255) NOT NULL
- `origin` TEXT NOT NULL
- `user_agent` TEXT NULL
- `ip_address` TEXT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

Indexes:
- unique `challenge_hash`
- index `(purpose, expires_at)` where `used_at IS NULL`

### 3.2 Session Lifecycle
- Reuse existing `auth_sessions` table for authenticated app sessions.
- Passkey verification success issues the same cookie/session lifecycle used today.
- `auth_magic_links` remains for fallback/recovery and controlled bootstrap flows.

## 4. API Contract Shape (Design Lock)

### Passkey registration
1. `POST /api/auth/passkey/register/options`
- Auth required (or bootstrap policy-defined)
- Returns WebAuthn creation options and one-time challenge reference

2. `POST /api/auth/passkey/register/verify`
- Verifies attestation response
- Stores credential
- Marks challenge used

### Passkey authentication
1. `POST /api/auth/passkey/login/options`
- Accepts email identifier (or discoverable credential mode)
- Returns request options + challenge

2. `POST /api/auth/passkey/login/verify`
- Verifies assertion response
- Updates sign counter and `last_used_at`
- Issues `auth_sessions` cookie

### Email fallback (secondary path)
1. `POST /api/auth/recovery/request`
- Generic response (non-enumerating)
- Uses magic-link delivery for recovery/bootstrap only

2. `POST /api/auth/recovery/verify`
- Verifies fallback token
- Issues short-lived authenticated session
- Encourages/enforces passkey enrollment depending on rollout stage

## 5. Email Fallback Semantics
1. Fallback is not the primary login UX once passkeys are live.
2. Fallback remains available for:
   - first-device bootstrap from known email identity
   - account recovery when no passkey is available
3. Fallback responses stay non-enumerating.
4. Fallback tokens remain hashed-at-rest and one-time-use.

## 6. Infrastructure and Config Requirements
Required runtime config for passkeys:
1. `AUTH_WEBAUTHN_RP_ID`
2. `AUTH_WEBAUTHN_RP_NAME`
3. `AUTH_WEBAUTHN_ORIGIN` (single or allowlisted set)

Operational constraints:
1. HTTPS required in production for WebAuthn ceremonies.
2. Strict origin/rpId validation on verify endpoints.
3. Replay protection via one-time challenge consumption.
4. Metrics needed for registration success, auth success, fallback usage, and failures.

## 7. Rollout and Compatibility Plan
1. Stage A (current): keep magic-link auth + remembered-user unlock contract stable.
2. Stage B: introduce optional passkey enrollment for authenticated users.
3. Stage C: switch sign-in UX to passkey-first; keep email fallback behind explicit secondary action.
4. Stage D: optimize fallback usage policy (recovery/rare bootstrap only).

Backward compatibility:
1. Existing unlock/recommendation APIs remain unchanged.
2. Existing authenticated sessions remain valid during rollout.
3. No migration introduces passwords.

## 8. Explicit Non-Goals in This Step
1. No runtime WebAuthn implementation.
2. No frontend passkey UX implementation.
3. No changes to `docs/planning/final-implementation-plan.md`.

## 9. Open Decision (Captured)
Decision target: use existing `auth_sessions` for passkey-authenticated sessions.
- Recommended: **reuse `auth_sessions`** and annotate source in auth events/telemetry instead of creating parallel session storage.
- Reason: lower complexity, consistent cookie/session enforcement, fewer integration risks.
