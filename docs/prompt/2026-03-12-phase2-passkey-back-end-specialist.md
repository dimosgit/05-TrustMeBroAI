## 1. Feature Title
`Phase 2 Back-End Specialist: Passkey-First Auth Foundation`

## 2. Objective
Implement the backend foundation for Phase 2 returning-user account access using passkey-first authentication, with email fallback for recovery/bootstrap only. The goal is to establish a credible, modern account model without introducing passwords or disrupting the anonymous recommendation funnel.

## 3. Context
- Product area: `Backend auth and account lifecycle`
- Current behavior: `Phase 1 anonymous wizard + email unlock is stable, and the final implementation plan now defines Phase 2 as passkey-first auth with email fallback.`
- Problem to solve: `Returning users need a secure, low-friction account system that feels more credible than magic-link-only auth and does not require passwords.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`

## 4. Scope
- In scope:
  1. Implement passkey registration and sign-in backend flows using WebAuthn-compatible endpoints.
  2. Add persistence and repository support for:
     - `auth_passkeys`
     - `auth_sessions`
     - `auth_recovery_tokens`
  3. Implement authenticated session bootstrap endpoints required by the frontend.
  4. Implement fallback email recovery/bootstrap flow for users who cannot use passkeys yet.
  5. Preserve the anonymous wizard, email unlock, and current recommendation flow.
- Out of scope:
  1. Password-based auth.
  2. Separate username identity.
  3. Full recommendation history UI.
  4. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. Email remains the account identifier.
2. Passkey registration must support creating or upgrading a user account linked to an email.
3. Passkey sign-in must create a valid authenticated session cookie.
4. Fallback email recovery/bootstrap must be secondary and must not become the default auth path.
5. Existing unlock-created users must be able to transition into explicit account users.
6. Session handling must remain secure and production-usable.
7. Anonymous recommendation flow must remain available without pre-auth.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Use parameterized SQL only.
3. Keep security-sensitive state server-controlled and testable.
4. Do not reintroduce magic-link-only auth as the primary Phase 2 solution.
5. Do not add password or username fields, routes, or helpers.

## 7. Implementation Notes
1. Implement clear endpoint separation for:
   - passkey registration options
   - passkey registration verification
   - passkey authentication options
   - passkey authentication verification
   - auth session bootstrap (`me` / logout)
   - fallback email recovery/bootstrap
2. Reuse the existing account and unlock-linked user model where possible instead of duplicating identity records.
3. Keep recovery token behavior short-lived, one-time-use, and clearly secondary to passkeys.
4. Document the exact backend contract for FE and QA under `docs/planning/`.
5. If WebAuthn server-side library choices require setup decisions, keep the implementation minimal, standard, and well-documented.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit/integration tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - passkey registration success
   - passkey sign-in success
   - invalid challenge / replay failure paths
   - fallback email recovery/bootstrap
   - unlock-created user upgrading into explicit account
   - anonymous unlock non-regression

## 9. Acceptance Criteria
1. Backend supports passkey-first registration and sign-in.
2. Recovery/bootstrap email flow works as fallback only.
3. Existing users can transition into explicit accounts cleanly.
4. Session lifecycle is test-backed and stable.
5. Anonymous conversion path remains intact.

## 10. Deliverables
1. Backend code changes implementing passkey-first auth foundation.
2. Test changes proving correctness and non-regression.
3. A short backend contract note under `docs/planning/`.
4. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Frontend will consume a standard WebAuthn-style options/verification contract.
- Open questions:
  1. Should fallback email recovery create a temporary session directly or only bootstrap passkey setup completion?
