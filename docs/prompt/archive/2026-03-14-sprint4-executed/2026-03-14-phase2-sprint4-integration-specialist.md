## 1. Feature Title
`Phase 2 Sprint 4 Integration Specialist: Candidate Release Decision and FE Polish Closeout`

## 2. Objective
Drive the final integration and closeout of Phase 2 Sprint 4. The goal is to decide whether the first controlled research-ingestion candidate release is safe to accept, while also confirming the remaining FE auth-polish issues have current evidence behind them.

## 3. Context
- Product area: `Controlled release integration and final UX risk review`
- Current behavior: `Sprint 3 is complete. The remaining work is concentrated in the first controlled candidate release and the last known FE auth-polish risks.`
- Problem to solve: `We need one final integration pass that reconciles backend candidate-release support, QA evidence, and FE polish results into a clear go/no-go decision.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
5. `docs/planning/release-evidence/`

## 4. Scope
- In scope:
  1. Review the first controlled candidate release evidence and decision inputs.
  2. Review FE Safari zoom and result-transition evidence.
  3. Confirm anonymous funnel and internal route hygiene remain safe.
  4. Produce the Sprint 4 closeout decision.
- Out of scope:
  1. New design work.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Broad marketing or retrieval strategy changes.

## 5. Requirements
1. Produce a clear `Go`, `Go with known risks`, or `No-Go` decision for Sprint 4.
2. Block approval if candidate-release governance is violated or evidence is incomplete.
3. Block approval if FE polish remains broken and unbounded.
4. Confirm `/tasks-progress` remains disabled by default and still tracked as pre-go-live cleanup.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Prefer minimal integration fixes and explicit escalation over broad rewrites.
3. Treat evidence completeness as part of readiness, not optional documentation.
4. Do not allow Sprint 4 to blur into Phase 3 optimization work.

## 7. Implementation Notes
1. Review BE and QA candidate-release outputs first.
2. Review FE and QA real-device evidence second.
3. Save the final integration closeout report under `docs/planning/`.
4. If Sprint 4 is complete, prepare the next handoff cleanly from actual remaining work only.

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
3. Confirm evidence exists for:
   - candidate-release execution
   - benchmark and release bundle outputs
   - FE Safari zoom and result transition
   - anonymous funnel non-regression
   - internal route disabled-by-default behavior

## 9. Acceptance Criteria
1. Sprint 4 has a clear integration closeout decision.
2. Candidate-release safety has evidence, not just assertions.
3. Remaining FE polish risk is either closed or explicitly accepted with evidence.

## 10. Deliverables
1. Sprint 4 integration closeout report under `docs/planning/`.
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
  1. QA will produce a real release-evidence bundle in this sprint.
- Open questions:
  1. Is the desired Sprint 4 outcome approval of the first candidate release itself, or approval of the process plus a deferred apply?
