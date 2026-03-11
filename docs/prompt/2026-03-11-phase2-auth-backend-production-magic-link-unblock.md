## 1. Feature Title
`Phase 2 Auth Back-End Specialist: Production Magic-Link Delivery Unblock`

## 2. Objective
Remove the Phase 2 auth release blocker by implementing production-usable magic-link delivery in the backend runtime path. Preserve security and non-enumeration behavior while making register/login flows operational for real users. Keep the existing conversion-first anonymous recommendation funnel unchanged.

## 3. Context
- Product area: `Backend auth delivery and runtime safety`
- Current behavior: `Auth endpoints and verification lifecycle are implemented, but delivery defaults to console-only provider`
- Problem to solve: `Register/login are not production-usable until a real delivery provider is integrated and verified`

## 4. Scope
- In scope:
  1. Integrate a real magic-link delivery provider adapter in backend runtime (SMTP or API provider) with environment-based configuration.
  2. Keep and validate production fail-fast guard when provider is misconfigured.
  3. Ensure register/login request flows trigger real delivery path without leaking token material.
  4. Add automated tests for provider invocation and auth rate-limit `429` behavior.
  5. Update Phase 2 auth API/ops notes in `docs/planning/` with provider configuration and rollout verification steps.
- Out of scope:
  1. Frontend auth UX redesign.
  2. Password auth or OAuth.
  3. Subscription/entitlements work.

## 5. Requirements
1. Production mode must not run with console-only magic-link delivery.
2. Register and login-request flows must invoke configured delivery adapter for eligible users.
3. Verification token must remain hashed at rest only; never log plaintext tokens in production logs.
4. Login request response must remain generic and non-enumerating.
5. Auth flow must remain magic-link only (no password endpoint/path).
6. Existing anonymous recommendation flow and unlock path must remain functional.
7. Add explicit automated assertion for auth endpoint rate-limit `429` behavior.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep integration changes minimal and focused on delivery unblock + safety.
3. Use parameterized SQL only.
4. Preserve current cookie/session security settings.
5. Do not introduce or reactivate any password-based auth code path.

## 7. Implementation Notes
1. Use provider abstraction (`magicLinkProvider`) so tests can stub provider calls deterministically.
2. Add env-driven provider selection and required config validation.
3. Ensure development fallback remains practical while production requires real provider.
4. Add focused integration coverage for:
   - provider called on register
   - provider called on login request for registered users
   - auth limiter returns `429` when threshold exceeded
5. Update `docs/planning/2026-03-11-phase2-auth-magic-link-api-contract.md` and/or closeout notes with exact provider config/runtime behavior.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit/integration tests: `cd backend && npm run test && npm run test:integration`
   - Schema/bootstrap sanity: `cd backend && npm run db:bootstrap`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Backend auth delivery path is production-usable with a real provider.
2. Production startup fails fast when provider config is missing/invalid.
3. Register/login/verify/me/logout behavior remains contract-aligned and fully green.
4. Auth rate-limit `429` is covered by committed automated test.
5. No regression in anonymous recommendation flow.

## 10. Deliverables
1. Backend code changes implementing real magic-link delivery integration and config validation.
2. Automated test changes proving delivery path + rate-limit behavior.
3. Updated planning/contract documentation with provider setup and verification evidence.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Provider credentials/secrets can be supplied securely via environment variables.
- Open questions:
  1. Which provider is the release default for first rollout (SMTP vs API vendor)?
