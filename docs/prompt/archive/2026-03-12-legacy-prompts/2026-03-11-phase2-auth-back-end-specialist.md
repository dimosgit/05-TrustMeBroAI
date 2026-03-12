## 1. Feature Title
`Phase 2 Auth Back-End Specialist: Explicit Register + Magic-Link Login`

## 2. Objective
Implement explicit account registration and returning-user login so users do not need to enter their email every time. Keep the MVP anonymous wizard flow intact, while adding a clear Phase 2 authentication layer aligned with the final implementation plan. Authentication must be passwordless (magic-link only), secure, testable, and production-ready.

## 3. Context
- Product area: `Back-end auth and session lifecycle`
- Current behavior: `Email unlock exists, but no robust explicit account registration/login flow used by frontend`
- Problem to solve: `Users cannot explicitly register and return with a clear login flow`

## 4. Scope
- In scope:
  1. Implement explicit auth API for passwordless flow:
     - `POST /api/auth/register`
     - `POST /api/auth/login/request`
     - `POST /api/auth/login/verify`
     - `GET /api/auth/me`
     - `POST /api/auth/logout`
  2. Register behavior:
     - creates account for new email OR upgrades existing email record from unlock/follow-the-build path into explicit registered account
     - persists consent + consent timestamp + signup source attribution
     - creates one-time login challenge (magic-link token)
     - sends magic link via provider adapter (dev-safe fallback allowed)
  3. Login behavior:
     - request endpoint accepts email and issues challenge
     - verify endpoint validates token, enforces TTL + one-time-use, sets auth cookie session
  4. Link historical data:
     - if existing recommendation sessions exist for same user email, keep continuity so returning user can later access history in Phase 2
  5. Keep anonymous Phase 1 recommendation flow working unchanged.
  6. Ensure unlock flow and auth sessions coexist cleanly.
  7. Add schema/migration support for one-time login challenges if missing.
- Out of scope:
  1. Password-based auth.
  2. OAuth/social login.
  3. Subscription/entitlements changes.
  4. Saved-history UI (frontend owned separately).

## 5. Requirements
1. Auth model must be `magic-link only` (no passwords).
2. Registration requires valid email + explicit consent.
3. Login request must not leak account existence details.
4. Verification token must be hashed at rest, short-lived, and one-time-use.
5. Session cookie must be `HttpOnly`, `SameSite` configured by environment, `Secure` in production.
6. `GET /api/auth/me` must return authenticated user or `401`.
7. `POST /api/auth/logout` must revoke session and clear cookie.
8. Rate limits must be applied on register/login/verify/me endpoints.
9. `register` and `login/request` responses must be safe and generic (`If the email is valid, you will receive a link.` style) to avoid enumeration.
10. Register must be idempotent for already-registered emails.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Align with final-plan Phase 2 auth decision: magic-link only.
3. Parameterized SQL only.
4. Do not break existing recommendation/session/unlock endpoints.
5. Do not introduce any password column, password hash, or password API.

## 7. Implementation Notes
1. Add dedicated persistence for login challenges (e.g., `auth_magic_links` table):
   - `id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `created_at`, optional metadata.
2. Add explicit account registration markers on users if missing (e.g., `registered_at`, `last_login_at`) through migration that is backward compatible with existing unlock-created users.
3. Generate opaque token server-side; hash with SHA-256 before storing.
4. Prefer generic responses for login request (`If an account exists, we sent a link.`).
5. Mail delivery should be abstracted behind a provider interface so tests can stub it.
6. Provide deterministic integration-test hooks without exposing insecure production endpoints.
7. Keep existing auth session table and cookie handling coherent with new verification flow.
8. Ensure unlock flow can optionally auto-link to authenticated user context when logged in.

## 8. Test Requirements
1. Add/update automated tests for all changed behavior.
2. Run before commit:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - new register (new email)
   - register on existing unlocked user email
   - login request generic response behavior
   - verify success, expired token, reused token, invalid token
   - me/logout lifecycle

## 9. Acceptance Criteria
1. Explicit register endpoint exists and issues magic-link challenge.
2. Explicit login request + verify flow works end-to-end with cookie session.
3. `auth/me` and logout work reliably.
4. Anonymous recommendation flow remains functional.
5. Security controls (token hashing, TTL, one-time use, rate limits) are enforced and tested.
6. Existing unlock-created users can register/login without duplicate-account issues.

## 10. Deliverables
1. Backend auth/session code + schema updates.
2. Automated tests proving auth behavior and non-regression.
3. Short API contract update note under `docs/planning/` for FE/QA consumption.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Email provider integration can use a development adapter if production provider is not yet configured.
- Open questions:
  1. Should login-link TTL be 10, 15, or 30 minutes for MVP Phase 2?
