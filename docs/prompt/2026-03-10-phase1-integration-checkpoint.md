## 1. Feature Title
`Phase 1 Agent 4: Integration Checkpoint and Merge Gate`

## 2. Objective
Run the final integration checkpoint between all Phase 1 agents and enforce merge readiness strictly against `docs/planning/final-implementation-plan.md`. Confirm no drift from conversion-first architecture and no hidden contract mismatches.

## 3. Context
- Product area: `Cross-agent integration`
- Current behavior: `Parallel agent delivery can introduce schema/API/UI drift`
- Problem to solve: `Prevent incorrect merges and enforce final-plan compliance`
- Recommended decision baseline from latest review: `Go with Mitigations` until:
  1. unlock validates `session_id` integrity with `recommendation_id`
  2. KPI tracking evidence is available for wizard completion, unlock conversion, and try-it CTR

## 4. Scope
- In scope:
  1. Verify backend/frontend contract compatibility end-to-end.
  2. Verify anonymous flow: landing -> wizard -> locked -> unlock -> unlocked -> feedback.
  3. Verify quality-gate command results and test completeness.
  4. Resolve or escalate integration defects with explicit owners.
- Out of scope:
  1. Phase 2/3 implementation work.
  2. New non-essential feature additions.

## 5. Requirements
1. Confirm no pre-auth gating in MVP path.
2. Confirm endpoint set and request/response schema are final-plan compliant.
3. Confirm locked/unlocked UI contract is preserved.
4. Confirm alternative tool cap, no score leakage, and valid feedback signals.
5. Confirm final docs/reports reflect real executed evidence.
6. Confirm `docs/planning/final-implementation-plan.md` remains unchanged.
7. Confirm integration-specialist payload compatibility fix remains intact (`try_it_url` and nested `primary_reason` support).
8. Verify and report KPI-readiness status against Phase 1 exit criteria (not just test pass status).

## 6. Technical Constraints
1. Git final plan is immutable source of truth.
2. Keep fixes minimal and integration-focused.
3. Block merge on unresolved P0/P1 contract defects.

## 7. Implementation Notes
1. Compare API contract docs with real runtime responses.
2. Validate one full manual happy path and one unhappy path per critical endpoint.
3. Reconcile any mismatch between specialist report claims and executable evidence.
4. Produce final merge recommendation with risk annotations.
5. Explicitly decide `Go` only if mitigation blockers are closed; otherwise keep `Go with Mitigations` and list owner/date for each mitigation.

## 8. Test Requirements
1. Execute and report:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`
   - `cd frontend && npm run test`
   - `cd frontend && npm run test:e2e:smoke`
2. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. No unresolved P0/P1 integration defects.
2. Contract and flow align with final plan.
3. Merge decision backed by reproducible command output.
4. Unlock integrity validation and KPI evidence status are explicitly documented.

## 10. Deliverables
1. Updated integration checkpoint report in `docs/planning/`.
2. Any minimal integration fixes needed.
3. Final decision: `Go` / `Go with Mitigations` / `No-Go`.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Agent outputs are available and ready for integration review.
- Open questions:
  1. If KPI tracking readiness remains partial, should the release be blocked or shipped with explicit mitigation plan?
