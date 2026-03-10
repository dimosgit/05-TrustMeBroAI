## 1. Feature Title
`Phase 1 Hardening QA Specialist: Closeout Gate`

## 2. Objective
Run a strict closeout QA pass for Phase 1 and determine release readiness with evidence. Confirm functional correctness, integration reliability, KPI-readiness, research-data utilization readiness, and performance-readiness against final-plan Phase 1 exit criteria.

## 3. Context
- Product area: `Cross-layer QA and release decision`
- Current behavior: `Integration is marked Go, but closeout evidence for KPI/performance must be verified`
- Problem to solve: `Need objective gate with reproducible proof`

## 4. Scope
- In scope:
  1. Re-validate anonymous conversion flow end-to-end.
  2. Validate unlock integrity checks and error paths.
  3. Validate KPI evidence availability and consistency.
  4. Validate compute latency measurement evidence and method.
  5. Validate Phase 1 research-to-seed utilization artifact and seed-data integrity.
  6. Publish release verdict.
- Out of scope:
  1. Implementing new product features.

## 5. Requirements
1. Report sections: `Risk Summary`, `Test Plan`, `Execution Results`, `Release Decision`.
2. Explicitly verify phase-1 exit criteria evidence:
   - wizard completion in under 60s median (measurement method and sample)
   - unlock conversion measurable
   - try-it click-through tracked
3. Confirm all required automated checks pass.
4. Classify open issues with severity and mitigation.
5. Verify that research-data usage is handled as Phase 1 manual curation (not automated ingestion), and is documented with clear mapping/normalization rules.

## 6. Technical Constraints
1. Final Git plan is the only source of truth.
2. No scope expansion beyond Phase 1 closeout hardening.
3. Flaky tests are defects until resolved.

## 7. Implementation Notes
1. Re-run backend and frontend checks from clean state.
2. Verify KPI queries/metrics with real data path (not assumed).
3. If evidence is partial, use `Go with Mitigations`, not `Go`.
4. Verify Back-End Specialist deliverable `docs/planning/2026-03-10-phase1-research-to-seed-utilization.md` is internally consistent with `backend/db/init/002_seed.sql` and final-plan constraints.

## 8. Test Requirements
1. Run and report:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
   - `cd backend && npm run db:bootstrap` (against local/dev DB) or report exact blocker if unavailable
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`
   - `cd frontend && npm run test`
   - `cd frontend && npm run test:e2e:smoke`
2. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Phase 1 closeout report is complete and evidence-backed.
2. Release verdict is explicitly justified.
3. Research-to-seed utilization evidence is validated and risk-annotated.
4. Remaining risks have owners and mitigation dates.

## 10. Deliverables
1. Dated QA closeout report under `docs/planning/`.
2. Any test additions/fixes required for trustworthy release decision.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `/Users/dimouzunov/00 Coding/05 TrustMeBroAI/05-TrustMeBroAI/docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Back-End and Front-End specialists have delivered hardening changes before final QA pass.
- Open questions:
  1. Minimum evidence threshold for upgrading from `Go with Mitigations` to `Go`.
  2. Which seed quality defects are release-blocking vs post-release curation candidates?
