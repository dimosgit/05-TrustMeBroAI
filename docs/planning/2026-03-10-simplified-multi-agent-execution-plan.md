# Simplified Multi-Agent Execution Plan

Source of truth: `docs/planning/final-implementation-plan.md`

## Executive Summary

To reduce coordination overhead while keeping quality high, run delivery with **4 agents**:

1. Tech Lead + Integrator
2. Backend + Data Engineer
3. Frontend + UI/UX Engineer
4. QA + Release Engineer

This model keeps ownership clear, supports parallel execution, and protects UI/UX and test quality without over-fragmenting responsibilities.

## Recommended Agent Roles

### 1) Tech Lead + Integrator
- Own architecture decisions and API contract definitions.
- Sequence PRs and run integration checkpoints.
- Enforce phase gates and final merge readiness.

### 2) Backend + Data Engineer
- Build and maintain backend modules and database schema.
- Deliver auth/session layer and protected APIs.
- Own backend infrastructure config (`docker-compose`, env alignment, DB reliability).

### 3) Frontend + UI/UX Engineer
- Build public + protected route architecture and auth UX.
- Implement wizard/result/feedback product flow.
- Own design consistency, reusable UI primitives, and responsive behavior.

### 4) QA + Release Engineer
- Define risk-based testing depth per change.
- Own unit/integration/E2E/visual test strategy and execution.
- Block weak merges and issue release verdict (`Go`, `Go with Mitigations`, `No-Go`).

## Ownership Map

| Agent | Primary Ownership | Allowed to Change | Must Coordinate Before Changing |
|---|---|---|---|
| Tech Lead + Integrator | `docs/planning/*`, contract docs, integration checklist | Contracts, delivery gates, cross-agent integration glue | Domain feature internals in FE/BE |
| Backend + Data Engineer | `backend/src/**`, `backend/db/**`, `docker-compose*.yml` | Auth/session, protected APIs, DB schema/indexes, backend config | Frontend UX structure/flows |
| Frontend + UI/UX Engineer | `frontend/src/**` | Route structure, auth screens, wizard/result/feedback UI, style tokens/components | Backend contracts and DB design |
| QA + Release Engineer | `backend/tests/**`, `frontend/src/**/*.test.*`, `e2e/**`, CI test workflow files | Test code, quality gates, release validation | Product behavior outside test scope unless coordinated |

## Dependency-Aware Phased Delivery

## Phase 0: Foundation (short, mandatory)
- Define contract baseline for auth + protected APIs.
- Split frontend into maintainable feature/module structure (replace monolithic app layout).
- Establish testing harness and CI checks.

Parallelizable:
- Backend scaffolding and frontend restructuring can run in parallel after contract draft.
- QA sets up test framework in parallel.

Exit criteria:
- CI runs baseline test pipeline.
- Contracts are documented and frozen for Phase 1.

## Phase 1: MVP Authentication Hard Gate (highest priority)
- Implement `users` + `auth_sessions` schema and secure session handling.
- Deliver register/login/logout/me backend.
- Enforce backend `requireAuth` on protected endpoints.
- Enforce frontend protected routing so wizard/result never render unauthenticated.

Exit criteria:
- Unauthenticated users cannot access protected screens or APIs.
- Auth flows are stable and tested.

## Phase 2: Protected Recommendation Flow
- Ensure `user_sessions`, `recommendations`, and feedback are user-owned.
- Implement end-to-end flow: login -> wizard -> recommendation -> feedback.
- Handle all loading/error states with polished UX.

Exit criteria:
- Recommendation and feedback persist correctly under authenticated user ownership.
- Full critical journey passes integration and E2E tests.

## Phase 3: Stabilization and Product Polish
- UI coherence pass across landing/auth/wizard/result.
- Accessibility and responsive refinements.
- Regression hardening, performance checks, final release checklist.

Exit criteria:
- No critical regressions.
- Visual baseline stable across key screens.

## Testing Strategy by Workstream

## Backend + Data Engineer
Required tests:
- Unit: validators, auth/session helpers, recommendation service logic.
- Integration: register/login/logout/me, protected endpoint 401 behavior, DB persistence ownership checks.

Done means:
- All backend unit + integration tests pass.
- No unresolved high-severity auth/data defects.

## Frontend + UI/UX Engineer
Required tests:
- Unit: route guards, wizard state transitions, key UI states.
- Integration: API success/error/loading behaviors.
- E2E (with QA): critical authenticated user journey.

Done means:
- Core flow works on desktop and mobile.
- No accessibility-blocking interaction failures on key screens.

## QA + Release Engineer
Required tests:
- Contract validation between FE and BE.
- E2E smoke + regression.
- Visual regression for Landing, Login, Register, Wizard, Result.

Done means:
- Release verdict documented with explicit residual risk.
- Merge blocked if critical defects remain.

## UI/UX Quality Protection Plan

1. Single design owner: **Frontend + UI/UX Engineer** has final design coherence authority.
2. Shared UI primitives first: define tokens/components (spacing, typography, inputs, buttons, cards) and require reuse.
3. Visual guardrails: every UI PR includes desktop + mobile screenshots.
4. Visual regression checks: block merges on critical diffs.
5. Avoid design drift: no ad-hoc global styling patterns without design-owner approval.
6. Improve polish without mess:
   - replace disruptive `alert` style interactions with inline/toast feedback
   - unify loading/empty/error states
   - maintain one consistent visual language across all screens

## Code Review and Merge Workflow

Branch strategy:
- Protected `main`.
- Feature branches: `codex/<agent>/<task>`.

PR sequencing:
1. Contracts/schema PRs
2. Backend + frontend implementation PRs
3. Integration/polish PRs

Review ownership:
- Domain owner reviews every PR.
- Tech Lead provides cross-domain approval for contract/integration-impacting changes.

Integration checkpoints:
- Daily integration pass for early conflict detection.
- Phase-end hardening checkpoint before next phase starts.

Merge safety:
- Required checks: unit + integration + E2E smoke (+ visual checks for UI PRs).
- No direct pushes to `main`.

## Key Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Backend/frontend contract drift | Broken runtime integration | Contract-first development and contract tests |
| UI inconsistency in parallel work | Product feels fragmented | Single UI owner + shared component system + visual checks |
| Weak tests under delivery pressure | Regressions reach users | QA-owned merge gates with required layer coverage |
| Late integration failures | Delayed releases | Daily integration checkpoints and strict phase exits |
| Overengineering before MVP auth gate | Missed priority and complexity growth | Enforce Phase 1 completion before expansion work |

## Final Recommended Execution Model

Use this **4-agent execution model** as the default operating structure for current project size and scope:

1. Keep architecture decisions centralized with the Tech Lead.
2. Keep backend and frontend delivery parallel after contracts are fixed.
3. Keep QA continuously active as a gate, not a final-step activity.
4. Prioritize authentication hard gate completion before any feature expansion.
