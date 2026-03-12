## 1. Feature Title
`Phase 2 Auth Back-End Specialist: Auth Credibility Hardening`

## 2. Objective
Strengthen the back-end authentication flow so explicit `Register` and `Login` feel like a real account system rather than a thin email form. Keep the final implementation plan intact by staying passwordless and magic-link based, but make the flow robust, clear, secure, and ready for repeated returning-user usage.

## 3. Context
- Product area: `Back-end authentication and account lifecycle`
- Current behavior: `Explicit auth exists or is being introduced, but the current shape risks feeling too lightweight and under-specified`
- Problem to solve: `A bare email-only flow can feel untrustworthy unless the account lifecycle, session behavior, and email delivery semantics are strong and explicit`

## 4. Scope
- In scope:
  1. Harden the explicit account lifecycle for `register`, `login request`, `verify`, `me`, and `logout`.
  2. Make registration and returning login semantically distinct in the API even though both use magic links.
  3. Add robust resend, expiry, one-time-use, and replay-protection behavior.
  4. Improve account metadata needed for a credible returning-user experience.
  5. Preserve the anonymous wizard and unlock flow without forcing pre-auth.
- Out of scope:
  1. Password-based authentication.
  2. OAuth or social login.
  3. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. Keep auth `magic-link only`, aligned with the final plan.
2. `POST /api/auth/register` must create or upgrade an account identity for the email and issue a registration magic link.
3. `POST /api/auth/login/request` must issue a login magic link for returning users with a generic non-enumerating response.
4. `POST /api/auth/login/verify` must enforce short TTL, one-time use, and replay protection.
5. Add resend support with cooldown protection, either via dedicated endpoint or explicit contract on the existing request endpoints.
6. `GET /api/auth/me` must return enough account information for the FE to present a real signed-in state.
7. Persist lifecycle fields needed for credibility and later history access, such as `registered_at`, `last_login_at`, and relevant source markers if missing.
8. Existing unlock-created users must be able to become explicit registered users without duplicate-account issues.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Do not introduce password storage, password reset flows, or password APIs.
3. Use parameterized SQL only.
4. Do not break existing recommendation, unlock, or feedback endpoints.
5. Keep rate limiting strict on register, login request, verify, and resend-related paths.

## 7. Implementation Notes
1. Treat `register` and `login request` as separate user intents with distinct analytics/audit signals, even if both end in a magic link.
2. Add or refine persistence for auth challenges with fields such as `token_hash`, `expires_at`, `used_at`, `intent`, `created_at`, and request metadata.
3. Use generic success responses for login request so account existence is not leaked.
4. Ensure email subjects and message semantics are distinct for registration vs sign-in so the user understands what happened.
5. Return a minimal but useful authenticated user object from `auth/me`, suitable for FE account chrome and later saved-history work.
6. If resend is implemented, enforce cooldown and cap repeated requests safely.
7. Document the exact API contract in a short note under `docs/planning/` for FE and QA.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit/integration tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - register for new user
   - register for existing unlock-created user
   - login request for registered user
   - generic login response for unknown user
   - verify success, expired token, invalid token, reused token
   - resend cooldown and rate limiting
   - me/logout lifecycle

## 9. Acceptance Criteria
1. Register and login are distinct, coherent, and secure API flows.
2. Returning login feels production-grade because resend, expiry, replay protection, and session persistence work reliably.
3. Existing unlock-created users can upgrade into explicit accounts without broken linking.
4. Anonymous recommendation flow still works unchanged.
5. QA has a stable contract and reproducible auth states to validate.

## 10. Deliverables
1. Back-end code changes implementing auth credibility hardening.
2. Test changes proving correctness and non-regression.
3. Short implementation summary including test command results.
4. Short contract note in `docs/planning/` for FE and QA.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. The product stays magic-link only for this phase.
- Open questions:
  1. What session duration should we use for a returning signed-in user before re-authentication is required?
