## 1. Feature Title
`Phase 1 Agent 3: QA and Release Validation Gate`

## 2. Objective
Act as independent quality gate for Phase 1 against the final Git plan. Validate that implementation is truly conversion-first, contract-correct, and release-ready, with explicit evidence for functional, regression, and KPI-readiness checks.

## 3. Context
- Product area: `Cross-layer QA (backend + frontend + integration behavior)`
- Current behavior: `Parallel implementation can pass local tests yet still miss plan-critical constraints`
- Problem to solve: `Provide objective go/no-go decision with risk-based findings`
- Current recommended decision baseline: `Go with Mitigations` until two items are explicitly verified:
  1. Unlock `session_id` integrity validation is enforced.
  2. Phase 1 KPI tracking evidence is present for wizard completion, unlock conversion, and try-it CTR.

## 4. Scope
- In scope:
  1. Validate all Phase 1 functional requirements from final plan.
  2. Validate contract compliance of locked/unlocked payloads.
  3. Validate anonymous flow and no pre-auth friction.
  4. Validate feedback, rate-limit, and error-handling behavior.
  5. Validate KPI-readiness for wizard completion, unlock conversion, and try-it tracking.
- Out of scope:
  1. Implementing net-new product features.
  2. Phase 2/3 roadmap delivery.

## 5. Requirements
1. Produce structured report with: `Risk Summary`, `Test Plan`, `Execution Results`, `Release Decision`.
2. Verify endpoint behavior and payload shape against final contract.
3. Verify UI restrictions: no scores, no comparison, max 3 tools.
4. Verify unlock requires consent.
5. Verify recommendation compute and flow are deterministic and stable.
6. Verify KPI instrumentation/readiness for Phase 1 exit criteria.
7. Re-validate integration-specialist findings and confirm fix for backend-native unlock payload shape is covered by tests.

## 6. Technical Constraints
1. Use final Git plan as sole source of truth.
2. Do not alter feature scope while testing.
3. Treat flaky/unstable tests as defects, not “acceptable noise”.

## 7. Implementation Notes
1. Re-run full quality gates on backend and frontend.
2. Add missing tests where plan-critical gaps exist.
3. Flag any claim in prior reports that lacks executable evidence.
4. Use severity labels (`P0`..`P3`) and confidence for findings.
5. Default release decision to `Go with Mitigations` unless KPI evidence and unlock integrity validation are both complete.

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
2. Add missing tests for uncovered Phase 1 requirements.
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Clear pass/fail per Phase 1 requirement.
2. Evidence-backed release verdict (`Go`, `Go with Mitigations`, `No-Go`).
3. All P0/P1 defects explicitly resolved or blocked with mitigation.
4. Report includes explicit pass/fail verdict for:
   - session/recommendation integrity checks on unlock
   - KPI data readiness against Phase 1 exit criteria

## 10. Deliverables
1. QA report document under `docs/planning/` with dated filename.
2. Any required test additions.
3. Final release recommendation.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend and frontend branches are available for QA verification.
- Open questions:
  1. If KPI tracking is partially implemented, what is the minimum data completeness threshold for `Go with Mitigations`?
