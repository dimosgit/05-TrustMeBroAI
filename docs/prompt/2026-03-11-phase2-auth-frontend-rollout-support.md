## 1. Feature Title
`Phase 2 Auth Front-End Specialist: Rollout Support and Post-Unblock Validation`

## 2. Objective
Harden and validate frontend auth UX for production rollout once backend delivery is enabled. Ensure register/login/verify/logout states are resilient, clear, and contract-aligned while preserving the anonymous recommendation funnel performance and conversion behavior.

## 3. Context
- Product area: `Frontend auth UX and integration stability`
- Current behavior: `Core auth routes exist and tests are green, but rollout confidence depends on backend delivery unblock + final UX resilience checks`
- Problem to solve: `Prevent frontend-side regressions or unclear user states during Phase 2 auth release`

## 4. Scope
- In scope:
  1. Re-validate FE contract usage for `/auth/register`, `/auth/login/request`, `/auth/login/verify`, `/auth/me`, `/auth/logout`.
  2. Harden error and fallback UX for provider/downstream failures (network/timeout/5xx) on register/login/verify.
  3. Validate redirect handling and sanitized return paths across register/login/verify pages.
  4. Re-validate non-regression of anonymous wizard -> locked -> unlock flow.
  5. Update frontend auth UX note with final rollout behavior and known mitigations.
- Out of scope:
  1. Backend provider integration.
  2. New account-history product features.
  3. Password or OAuth UI.

## 5. Requirements
1. Register and login pages must keep generic/non-enumerating success messaging.
2. Verify page must handle invalid/expired token and backend outage states with actionable recovery.
3. Auth bootstrap (`auth/me`) must not block anonymous funnel usage.
4. Logout must always leave UI in unauthenticated state even if server response is delayed/fails.
5. Existing conversion-first anonymous flow must remain unchanged and green.
6. No password-based UX path may be introduced.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep changes minimal and integration-focused.
3. Preserve existing API contracts (no unauthorized contract expansion without backend alignment).
4. Maintain accessibility and keyboard-submit behavior for auth forms.
5. Do not add pre-auth gates to wizard start.

## 7. Implementation Notes
1. Reuse existing API error model (`ApiError`, `ApiNetworkError`, `ApiTimeoutError`) for clear user-facing fallbacks.
2. Keep navigation/auth state logic in `AuthContext` deterministic across refresh and route changes.
3. Add/extend tests for:
   - verify failure recovery link path
   - timeout/network handling on register/login/verify
   - logout UI resilience
   - unchanged anonymous recommendation funnel behavior
4. Update `docs/planning/2026-03-11-phase2-auth-ux-note.md` with final behavior references.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Unit/integration: `cd frontend && npm run test`
   - Smoke: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. FE auth UX remains contract-aligned and production-robust after backend delivery unblock.
2. Error states are clear, recoverable, and non-blocking for anonymous flow where appropriate.
3. Redirect and session bootstrap behavior is stable and test-backed.
4. Anonymous recommendation funnel remains non-regressed.

## 10. Deliverables
1. Frontend integration hardening code changes (if needed).
2. Test updates proving auth UX resilience and funnel non-regression.
3. Updated auth UX note in `docs/planning/` with final rollout behavior.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend auth provider integration and endpoint contracts are finalized before final FE sign-off.
- Open questions:
  1. Should FE add a post-verify "continue to previous intent" fallback when redirect is absent beyond default `/wizard`?
