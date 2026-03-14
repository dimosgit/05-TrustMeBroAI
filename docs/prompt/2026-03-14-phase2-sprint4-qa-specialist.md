## 1. Feature Title
`Phase 2 Sprint 4 QA Specialist: Controlled Candidate Release and Fresh Real-Device Validation`

## 2. Objective
Execute the first controlled research-ingestion candidate release with real release evidence, and re-run fresh real-device validation for the remaining frontend auth-polish issues. The goal is to move from scaffolding to a real gated release candidate while tightening confidence in the FE experience.

## 3. Context
- Product area: `QA release execution and real-device evidence`
- Current behavior: `Sprint 3 completed the ingestion dry-run foundation and the benchmark/evidence scaffolding. The remaining work is to execute the first controlled candidate release and attach fresh evidence for the FE polish issues.`
- Problem to solve: `We need real release evidence, not just framework docs, and we need updated Safari/device validation after the next FE polish pass.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
5. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`
6. `docs/planning/release-evidence/`

## 4. Scope
- In scope:
  1. Execute the first controlled research-ingestion candidate release against the benchmark/evidence framework.
  2. Generate a real release-evidence bundle.
  3. Re-run real-device Safari validation after FE polish work lands.
  4. Confirm anonymous funnel and internal route hygiene remain safe.
- Out of scope:
  1. Editing `docs/planning/final-implementation-plan.md`.
  2. Broad new feature design work.
  3. Vector or semantic retrieval validation.

## 5. Requirements
1. Produce an explicit QA decision for the first controlled candidate release.
2. Generate release evidence using the templates/scaffolding already in repo.
3. Re-run Safari/device validation for the zoom issue and result transition after FE changes.
4. Keep anonymous funnel and internal route hygiene in the regression set.
5. Escalate any candidate-release governance violation as a blocker.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Use the architect evaluation framework as the gate reference.
3. Keep release evidence reproducible and auditable.
4. Do not accept uncontrolled apply behavior.

## 7. Implementation Notes
1. Use the first real candidate release as a discipline test for the full ingestion process.
2. Save the release evidence bundle under `docs/planning/release-evidence/<release-id-or-date>/`.
3. Save the QA gate report under `docs/planning/`.
4. Explicitly separate:
   - candidate release evidence
   - FE Safari/transition validation evidence
5. If FE fixes are not yet sufficient, report that clearly rather than weakening the gate.

## 8. Test Requirements
1. Run relevant checks before any QA signoff:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend unit tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
2. Add or update automated tests only when QA-owned gate coverage requires it.
3. Do not create a commit if any required validation fails.
4. Include validation coverage for:
   - candidate-release apply/dry-run behavior
   - benchmark and release-evidence outputs
   - Safari/device zoom and transition behavior
   - anonymous funnel non-regression
   - internal route disabled-by-default behavior

## 9. Acceptance Criteria
1. First controlled candidate release has a real QA decision with evidence.
2. Fresh real-device FE evidence exists for the remaining auth polish issues.
3. Anonymous funnel and internal route hygiene remain safe.

## 10. Deliverables
1. Sprint 4 QA release-gate report under `docs/planning/`.
2. Release-evidence bundle under `docs/planning/release-evidence/`.
3. Short implementation summary including exact commands executed and outcomes.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code or docs that claim signoff when checks failed.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of guessing.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend controlled candidate-release support and FE polish fixes will land before final QA signoff.
- Open questions:
  1. What release id/date naming convention should be used for the first real evidence bundle?
