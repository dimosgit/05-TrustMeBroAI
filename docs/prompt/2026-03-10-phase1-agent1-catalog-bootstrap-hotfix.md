## 1. Feature Title
`Phase 1 Agent 1 Hotfix: Wizard Catalog Bootstrap Failure`

## 2. Objective
Fix the blocking runtime issue where the wizard shows "Unable to load wizard options. Please retry." Ensure `GET /api/profiles`, `GET /api/tasks`, and `GET /api/priorities` are consistently reachable and return valid payloads in local/dev setup so users can progress through Phase 1 flow.

## 3. Context
- Product area: `Backend catalog API availability + environment/CORS integration`
- Current behavior: `Wizard cannot load options; frontend displays bootstrap error and blocks progression`
- Problem to solve: `Catalog bootstrap requests are failing (API unavailability, CORS/env mismatch, or contract mismatch)`

## 4. Scope
- In scope:
  1. Reproduce the failure end-to-end and identify root cause.
  2. Fix backend/API/env/CORS causes that break catalog bootstrap endpoints.
  3. Verify endpoint payload shape compatibility with frontend expectations.
  4. Add regression tests to prevent recurrence.
  5. If needed, make minimal frontend API-base fix only if root cause is endpoint URL wiring.
- Out of scope:
  1. New feature development outside this blocking bug.
  2. Phase 2+ roadmap work.

## 5. Requirements
1. `/api/profiles`, `/api/tasks`, `/api/priorities` must return HTTP `200` with arrays when backend is healthy.
2. CORS must allow frontend origin configured for local dev.
3. Local dev environment must resolve correct API base URL for frontend requests.
4. Error reproduction steps and fix must be documented.
5. Wizard must render option cards and allow progression past step 1 after fix.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as sole source of truth.
2. Keep fix minimal and targeted to bootstrap failure.
3. Do not introduce auth gating/login in MVP flow.
4. Preserve existing endpoint names and Phase 1 anonymous access model.

## 7. Implementation Notes
1. Inspect actual failing request path/status/body from browser + backend logs.
2. Validate frontend API base resolution in local setup (`VITE_API_BASE_URL`).
3. Validate backend CORS allowlist and `FRONTEND_ORIGIN` behavior.
4. Validate catalog repositories/services return expected schema fields (`id`, `name`, `description`, plus `category` for tasks).
5. Add/extend integration test covering catalog bootstrap endpoint availability.
6. Add smoke verification for wizard landing -> profile options visible.

## 8. Test Requirements
1. Add or update automated tests for changed behavior.
2. Run required checks before commit:
   - Backend lint: `cd backend && npm run lint`
   - Backend typecheck: `cd backend && npm run typecheck`
   - Backend unit tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. The wizard no longer shows "Unable to load wizard options" in healthy local setup.
2. Profile/task/priority options load successfully and are selectable.
3. Root cause is documented with concrete before/after behavior.
4. Regression tests pass and cover the failure path.

## 10. Deliverables
1. Code fix for catalog bootstrap failure.
2. Test updates proving the fix.
3. Short incident summary including:
   - root cause
   - files changed
   - commands run + pass/fail

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. This is a bootstrap integration bug, not a planned product behavior.
- Open questions:
  1. Is the failure reproducible in both Docker and non-Docker local run paths, or only one?
