# Phase 2 Sprint 4 QA Release Gate Report (2026-03-14)

## Risk Summary
- Risk tier: `High` (first controlled ingestion candidate execution + FE polish validation on real devices).
- Sprint 4 QA objective:
1. Execute first controlled candidate release with real evidence.
2. Validate FE polish outcomes with fresh Safari/device evidence.
3. Keep anonymous funnel and internal-route hygiene as regression gates.

Assumptions:
1. Release id convention for this first run: `YYYY-MM-DD-sprint4-candidate-###`.
2. Existing codebase state is the Sprint 4 candidate.

Untested areas:
1. Fresh real-device Safari validation for zoom and result transition was not executed in this terminal-only run.
2. Candidate scenario-level diff evaluation command is not yet implemented (`recommendation:evaluate` placeholder only in framework).

Plan immutability:
1. `docs/planning/final-implementation-plan.md` was not modified.

## Test Plan
1. Run required backend/frontend command matrix.
2. Execute controlled candidate workflow:
   - DB bootstrap
   - ingestion dry-run
   - guarded apply with explicit confirmation token
3. Produce a real evidence bundle under `docs/planning/release-evidence/<release-id>/`.
4. Validate FE polish code/test coverage (iOS viewport normalization + result auto-unlock pending behavior).
5. Validate anonymous funnel and internal route default-disable behavior.

## Execution Results
### Required Command Matrix
1. `cd backend && npm run lint` -> `PASS`
2. `cd backend && npm run typecheck` -> `PASS`
3. `cd backend && npm run test` -> `PASS` (`15/15`)
4. `cd backend && npm run test:integration` -> `PASS` (`33/33`)
5. `cd frontend && npm run lint` -> `PASS`
6. `cd frontend && npm run build` -> `PASS`
7. `cd frontend && npm run test` -> `PASS` (`53/53`)
8. `cd frontend && npm run test:e2e:smoke` -> `PASS` (`1/1`)

### Controlled Candidate Release
#### Attempt 1 (Release ID: `2026-03-14-sprint4-candidate-001`)
1. `cd backend && npm run db:bootstrap` -> `PASS`
2. `cd backend && npm run research:ingest:dry-run` -> `PASS`
   - `sources=11`
   - `candidates=30`
   - `conflicts=90`
   - `approved=0`
3. `cd backend && npm run research:ingest:apply -- --release-id 2026-03-14-sprint4-candidate-001 --confirm APPLY_CANDIDATE_RELEASE` -> `FAIL`
   - Failure: `No approved tools found in curation decisions`
4. Governance interpretation:
   - Guardrails worked correctly (candidate apply blocked).
   - Candidate is not eligible for controlled apply.

Release-evidence bundle generated for attempt 1:
1. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-001/evaluation-summary.md`
2. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-001/scenario-diff.json`
3. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-001/review-decisions.json`
4. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-001/gate-decision.md`

#### Attempt 2 (Release ID: `2026-03-14-sprint4-candidate-002`)
1. `cd backend && npm run db:bootstrap` -> `PASS`
2. `cd backend && npm run research:ingest:dry-run` -> `PASS`
   - `sources=11`
   - `candidates=30`
   - `conflicts=87`
   - `approved=3`
3. `cd backend && npm run research:ingest:apply -- --release-id 2026-03-14-sprint4-candidate-002 --confirm APPLY_CANDIDATE_RELEASE` -> `PASS`
   - `applied_tools=3` (`n8n`, `notebooklm`, `notion-ai`)
4. Governance interpretation:
   - Controlled candidate apply now succeeds with guardrails intact.
   - Backend governance blocker is closed.

Release-evidence bundle generated for attempt 2:
1. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-002/backend-apply-summary.json`
2. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-002/evaluation-summary.md`
3. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-002/scenario-diff.json`
4. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-002/review-decisions.json`
5. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-002/gate-decision.md`

### FE Polish and Regression Findings
1. iOS Safari zoom mitigation code/tests -> `PASS (code-level)`
   - Evidence: `frontend/src/features/auth/passkeyClient.js`
   - Evidence: `frontend/src/test/passkey-client.test.js`
2. `/result` auto-unlock transition stabilization -> `PASS (code-level)`
   - Evidence: `frontend/src/features/result/ResultPage.jsx`
   - Evidence: `frontend/src/test/auth-phase2-sprint2.test.jsx` (`auto-unlock-pending` expectations)
3. Fresh real-device Safari evidence after polish -> `DEFERRED`
   - No new real-device run was captured in this terminal-only session.
   - Product decision: carry this validation into the next sprint as explicit follow-up.
4. Follow-the-build capture regression safety -> `PASS`
   - Evidence: `frontend/src/test/landing-follow-build.test.jsx`
   - Evidence: backend follow-build integration tests still passing.
5. Anonymous funnel non-regression -> `PASS`
   - Evidence: existing backend recommendation integration and frontend gating/smoke suites pass.
6. Internal route hygiene -> `PASS`
   - Evidence: `frontend/src/app/AppRoutes.jsx` default-disabled internal route guard.
   - Evidence: `frontend/src/test/tasks-progress.test.jsx` default-disabled behavior.

### Open Findings
1. `[Open][P2][Carryover]` Fresh real-device Safari evidence for zoom/transition polish is pending.
   - Owner: QA Specialist + FE Specialist.
   - Status: explicitly moved to next sprint.

## Release Decision
1. Sprint 4 QA gate decision: `Go with known risks`.
2. Rationale:
   - Controlled candidate release executed successfully (`candidate-002`) with governance guardrails intact.
   - All required automated backend/frontend gates passed in this sprint.
3. Accepted known risk:
   - Fresh real-device Safari evidence is deferred to next sprint and tracked as carryover work.
4. Next required actions:
   - Execute and log fresh iOS Safari real-device pass for passkey zoom and `/result` transition behavior in next sprint.
