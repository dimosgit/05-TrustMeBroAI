## 1. Feature Title
`Phase 2 Auth QA Specialist: Register/Login Release Gate`

## 2. Objective
Execute a strict QA gate for explicit register + login flows and determine release readiness. Validate security-sensitive auth behavior, UX clarity, and non-regression of the recommendation funnel.

## 3. Context
- Product area: `Cross-layer quality verification for authentication rollout`
- Current behavior: `Auth capabilities exist partially, but explicit register/login experience is being introduced`
- Problem to solve: `Need trustworthy evidence that auth works without harming conversion flow`

## 4. Scope
- In scope:
  1. Validate register flow (email+consent) and login request flow.
  2. Validate magic-link verify success and failure paths (expired/invalid/reused token).
  3. Validate `auth/me` bootstrap and logout behavior.
  4. Validate security and abuse controls (rate limit, no user-enumeration leakage).
  5. Validate non-regression for anonymous wizard -> locked -> unlock flow.
  6. Validate upgrade path for existing users created during unlock flow:
     - existing unlock email can register/login without duplicate account confusion
  7. Publish QA release verdict.
- Out of scope:
  1. New feature implementation beyond test fixes required to stabilize release.

## 5. Requirements
1. QA report sections must include: `Risk Summary`, `Test Matrix`, `Execution Evidence`, `Release Decision`.
2. Explicitly test both happy and unhappy paths for all auth endpoints.
3. Verify cookie/session behavior across refresh and logout.
4. Verify frontend auth UX copy and interaction states.
5. Confirm recommendation flow remains conversion-first and functional.
6. Confirm register/login messaging does not expose whether an account exists.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Treat flaky auth tests as defects until resolved.
3. No scope drift into Phase 3.
4. Ensure solution remains magic-link only (no password flow in API or UI).

## 7. Implementation Notes
1. Validate API responses against documented contract updates.
2. Include at least one end-to-end scenario:
   - register -> verify -> authenticated session -> logout -> anonymous state.
3. Include one returning-user scenario:
   - login request -> verify -> run wizard -> unlock.
4. Confirm no password UX/API path is required or exposed.
5. Include one migration scenario:
   - unlock-created email user -> explicit register -> verify -> authenticated session.

## 8. Test Requirements
1. Run and report:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`
   - `cd frontend && npm run test`
   - `cd frontend && npm run test:e2e:smoke`
2. Do not create a commit if any required check fails.
3. Include targeted reruns for failed suites after fixes and report rerun status clearly.

## 9. Acceptance Criteria
1. Register/login/verify/me/logout behaviors are evidence-backed and stable.
2. Security controls are validated (token one-time use + TTL + rate limits + no enumeration leakage).
3. No critical regression in anonymous recommendation flow.
4. Final QA verdict is clear: `Go`, `Go with Mitigations`, or `No-Go`.
5. Upgrade path from unlock-only users to explicit account users is validated.

## 10. Deliverables
1. Dated QA report under `docs/planning/`.
2. Any test fixes required to make the release decision trustworthy.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Back-End and Front-End specialists deliver contract-aligned implementations before final QA run.
- Open questions:
  1. Minimum soak period required before moving from `Go with Mitigations` to `Go`?
