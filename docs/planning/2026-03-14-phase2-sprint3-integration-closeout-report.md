# Phase 2 Sprint 3 Integration Closeout Report (2026-03-14)

## Risk Summary
- Risk tier: `High` (new acquisition funnel + ingestion foundation + auth UX carryover).
- Integration objective:
1. Confirm follow-the-build capture is separate from unlock/account flows and wired end to end.
2. Confirm research ingestion remains artifact-first and non-runtime.
3. Confirm internal route hygiene (`/tasks-progress`) remains disabled by default.
4. Re-run full backend/frontend release matrix before closeout.

Assumptions:
1. Existing Sprint 3 backend, QA, and marketing artifacts are the active handoff baseline.
2. Existing real-device notes for iOS Safari zoom are still the latest known evidence.

Untested areas:
1. No fresh real-device iOS Safari re-run was executed in this integration pass.

## Test Plan
1. Verify Sprint 3 backend contract and governance artifacts.
2. Validate frontend follow-the-build implementation against backend contract.
3. Re-run required command matrix:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`
   - `cd frontend && npm run test`
   - `cd frontend && npm run test:e2e:smoke`
4. Re-run ingestion dry-run evidence command:
   - `cd backend && npm run research:ingest:dry-run`

## Execution Results
### 1. Follow-the-build FE/BE contract and attribution
Status: `PASS`

Evidence:
1. Backend endpoint contract remains stable at `POST /api/follow-the-build/capture` with `email` + `email_consent=true` and distinct source attribution (`signup_source = follow_the_build`).
2. Frontend now implements and calls that contract:
   - `frontend/src/lib/api/growthApi.js`
   - `frontend/src/features/landing/LandingPage.jsx`
3. Frontend behavior validated by automated tests:
   - `frontend/src/test/landing-follow-build.test.jsx`
   - Covers render, invalid email handling, success state, and backend failure handling.

### 2. Ingestion governance boundaries
Status: `PASS`

Evidence:
1. Dry-run ingestion command passed:
   - `cd backend && npm run research:ingest:dry-run`
   - Output: `sources=11`, `candidates=30`, `conflicts=90`, `approved=0`
2. Deterministic artifact-first staging path remains in use:
   - `backend/db/staging/research_ingest/`
3. Runtime recommendation behavior remains unchanged and covered by backend unit/integration suites.

### 3. Internal route hygiene
Status: `PASS`

Evidence:
1. `/tasks-progress` is still gated by `VITE_ENABLE_INTERNAL_ROUTES === "true"`:
   - `frontend/src/app/AppRoutes.jsx`
2. Default-disabled route behavior test passes:
   - `frontend/src/test/tasks-progress.test.jsx`

### 4. Regression and matrix validation
Status: `PASS`

Executed command outcomes:
1. `cd backend && npm run lint` -> `PASS`
2. `cd backend && npm run typecheck` -> `PASS`
3. `cd backend && npm run test` -> `PASS` (`12/12`)
4. `cd backend && npm run test:integration` -> `PASS` (`33/33`)
5. `cd frontend && npm run lint` -> `PASS`
6. `cd frontend && npm run build` -> `PASS`
7. `cd frontend && npm run test` -> `PASS` (`49/49`)
8. `cd frontend && npm run test:e2e:smoke` -> `PASS` (`1/1`)

Additional integration fixes validated in this run:
1. History loading race corrected (`frontend/src/features/history/HistoryPage.jsx`).
2. Passkey-enrollment nudge redirect normalized after recovery verify (`frontend/src/app/layout/AppShell.jsx`).

## Release Decision
1. Sprint 3 integration decision: `Go with known risks`.
2. Rationale:
   - All required automated validation is green.
   - Follow-the-build flow is now coherent end to end.
   - Ingestion foundation remains within approved non-runtime boundaries.
   - Internal route hygiene remains explicit and safe by default.
3. Remaining known risk (non-blocking):
   - iOS Safari post-passkey zoom remains an open UX issue pending fresh real-device validation.
4. Ownership:
   - FE owner: close iOS Safari zoom issue and attach updated real-device evidence in next QA pass.
