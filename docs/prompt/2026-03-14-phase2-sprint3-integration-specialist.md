## 1. Feature Title
`Phase 2 Sprint 3 Integration Specialist: Growth Capture, Ingestion Governance, and Merge Closeout`

## 2. Objective
Drive final integration and closeout of Phase 2 Sprint 3. Reconcile the new follow-the-build capture flow end to end, verify that the research-ingestion foundation matches the architected governance model, and block merge if anonymous conversion flow, attribution clarity, or route hygiene regresses.

## 3. Context
- Product area: `Cross-agent Sprint 3 integration and merge readiness`
- Current behavior: `Sprint 3 combines a new growth surface, research-ingestion foundation work, QA gate scaffolding, and frontend polish issues.`
- Problem to solve: `We need one final integration pass that checks growth-flow correctness, ingestion-governance alignment, regression safety, and release readiness before Sprint 3 is treated as complete.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-recommendation-data-architecture.md`
5. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`

## 4. Scope
- In scope:
  1. Reconcile follow-the-build FE/BE contract and source attribution.
  2. Verify research-ingestion foundation matches the architect-approved boundaries.
  3. Review QA results and frontend polish outcomes.
  4. Confirm anonymous funnel and internal-route hygiene remain safe.
  5. Produce Sprint 3 closeout decision and blockers, if any.
- Out of scope:
  1. Fresh feature design work.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Marketing strategy redesign.

## 5. Requirements
1. Validate that follow-the-build capture is clearly separate from unlock/account flows.
2. Validate that research ingestion remains staging/artifact-first and non-runtime in this slice.
3. Validate that `/tasks-progress` remains disabled by default and cannot silently leak back into public routing.
4. Review QA findings and mark Sprint 3 as `Go`, `Go with known risks`, or `No-Go`.
5. Produce a short integration closeout report with exact blockers and ownership if any remain.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Prefer minimal integration fixes and explicit escalation over broad rewrites.
3. Do not approve Sprint 3 if the separate capture attribution model is muddled or if research-ingestion design boundaries are violated.
4. Keep go-live hygiene explicit, especially for internal routes.

## 7. Implementation Notes
1. Review BE, FE, QA, and Marketing deliverables first before changing anything.
2. Check both contract alignment and product-behavior alignment.
3. Treat any move toward runtime raw-research reads or premature retrieval complexity as an integration blocker.
4. Save the final integration report under `docs/planning/`.
5. If the batch is complete, prepare prompt/planning handoff for the next batch.

## 8. Test Requirements
1. Re-run relevant validation as needed before final signoff:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend unit tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
2. Do not create a commit if any required validation fails.
3. Confirm QA coverage exists for:
   - follow-the-build capture
   - source attribution separation
   - ingestion gate scaffolding
   - anonymous funnel non-regression
   - internal route disabled-by-default behavior

## 9. Acceptance Criteria
1. Sprint 3 has a clear integration closeout decision.
2. Follow-the-build capture and source attribution are coherent end to end.
3. Research-ingestion foundation respects architect-approved governance.
4. Anonymous flow remains intact and internal routes remain safe.

## 10. Deliverables
1. Sprint 3 integration closeout report under `docs/planning/`.
2. Any minimal integration fixes required for readiness.
3. Short implementation summary including exact commands executed and outcomes.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of hiding them.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. BE, FE, QA, and Marketing will each produce a short handoff note or report for review.
- Open questions:
  1. Is the first research-ingestion slice expected to stop at dry-run artifacts, or is a guarded apply path acceptable if tests and QA gates are already strong?
