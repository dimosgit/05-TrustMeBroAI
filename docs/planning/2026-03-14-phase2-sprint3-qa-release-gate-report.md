# Phase 2 Sprint 3 QA Release Gate Report (2026-03-14)

## Risk Summary
- Risk tier: `High` (new growth funnel surface + ingestion gate foundation + auth UX polish carryover).
- QA objective:
1. Validate follow-the-build capture as a distinct funnel from unlock.
2. Validate ingestion QA gate scaffolding against architect framework.
3. Validate remaining FE polish outcomes (iOS zoom + result auto-unlock transition).
4. Validate anonymous funnel/passkey non-regression.
5. Confirm internal routes are disabled by default.

Assumptions:
1. Current workspace changes represent the Sprint 3 candidate.
2. Previously reported real-device iOS Safari evidence is still valid for known zoom behavior.

Untested areas:
1. New real-device pass on iOS Safari zoom and result micro-blink was not re-run in this exact QA session.
2. Wider browser/device matrix beyond existing desktop/mobile evidence was not re-run in this session.

Plan immutability:
1. `docs/planning/final-implementation-plan.md` was not modified.

## Test Plan
1. Run required command matrix across backend/frontend.
2. Validate follow-the-build contract and attribution using integration evidence.
3. Validate follow-the-build frontend availability and separation from unlock flow.
4. Validate ingestion dry-run and artifact generation.
5. Formalize QA-owned benchmark/release-evidence scaffolding from architect framework.
6. Validate internal route default disable behavior.
7. Reconfirm anonymous/passkey/history non-regression via existing suites.

## Execution Results
### Required Command Matrix
1. `cd backend && npm run lint` -> `PASS`
2. `cd backend && npm run typecheck` -> `PASS`
3. `cd backend && npm run test` -> `PASS` (`12/12`)
4. `cd backend && npm run test:integration` -> `PASS` (`33/33`)
5. `cd frontend && npm run lint` -> `PASS`
6. `cd frontend && npm run build` -> `PASS`
7. `cd frontend && npm run test` -> `PASS` (`45/45`)
8. `cd frontend && npm run test:e2e:smoke` -> `PASS` (`1/1`)

### Sprint 3 Scope Findings
1. Follow-the-build backend contract and source attribution -> `PASS`
   - Evidence: `backend/test/integration/follow-build-capture.test.js`.
   - Endpoint exists: `POST /api/follow-the-build/capture`.
   - Distinct attribution verified: `signup_source = follow_the_build`.
   - Funnel event verified: `follow_the_build_captured`.
2. Follow-the-build frontend capture surface -> `FAIL`
   - Evidence: no follow-the-build capture implementation in `frontend/src/features/landing/LandingPage.jsx`.
   - Evidence: no frontend API usage for `/api/follow-the-build/capture`.
   - Impact: distinct funnel cannot be validated end-to-end yet.
3. Ingestion QA gate foundation -> `PASS with Scaffold Gap Closed`
   - Dry-run command executed:
     - `cd backend && npm run research:ingest:dry-run` -> `PASS`
     - Output: `sources=11`, `candidates=30`, `conflicts=90`, `approved=0`.
   - Artifacts generated in `backend/db/staging/research_ingest/`.
   - QA-owned scaffold created in this QA run:
     - `docs/planning/benchmarks/recommendation-benchmark-v1.json`
     - `docs/planning/release-evidence/README.md`
     - `docs/planning/release-evidence/templates/evaluation-summary.template.md`
     - `docs/planning/release-evidence/templates/scenario-diff.template.json`
     - `docs/planning/release-evidence/templates/review-decisions.template.json`
4. FE polish outcomes -> `PARTIAL`
   - Result auto-unlock pending-state coverage exists and passes (`frontend/src/test/auth-phase2-sprint2.test.jsx`).
   - iOS Safari post-passkey zoom remains an open known issue from prior real-device validation.
5. Anonymous/passkey/history non-regression -> `PASS`
   - Evidence: backend integration and frontend auth/history suites all green.
6. Internal route disabled-by-default behavior -> `PASS`
   - Evidence: `frontend/src/app/AppRoutes.jsx` gates `/tasks-progress` by `VITE_ENABLE_INTERNAL_ROUTES === "true"`.
   - Evidence: `frontend/src/test/tasks-progress.test.jsx` default-disabled test passes.

### Open Findings
1. `[Open][P1][Release blocker]` Sprint 3 frontend follow-the-build capture UI is missing.
   - Owner: FE Specialist
   - Why blocker: Sprint 3 objective requires validating this new growth surface end-to-end.
2. `[Open][P3][Non-blocking]` iOS Safari post-passkey zoom issue remains open.
   - Owner: FE Specialist
   - Status: documented residual UX risk.

## Release Decision
1. Sprint 3 QA gate decision: `No-Go`.
2. Blocking reason:
   - Follow-the-build capture cannot be signed off end-to-end because frontend landing capture surface is not implemented.
3. Non-blocking tracked mitigation:
   - iOS Safari post-passkey zoom issue remains open.
4. What is ready:
   - Backend follow-the-build contract and attribution.
   - Ingestion dry-run pipeline.
   - QA benchmark/release-evidence scaffolding.
   - Internal-route default disable behavior.
