# Progressive Agent Execution Plan (2 Agents First)

Source of truth: `docs/planning/final-implementation-plan.md`

## Executive Summary

Use a progressive staffing model:

1. **Phase 1 (MVP auth-first): 2 agents only**
2. **Phase 2 (feature expansion): add 1 QA agent**
3. **Phase 3 (optimization): add 1 platform/scale agent**

This keeps early coordination very light while preserving quality through strict phase gates.

## Agent Model by Phase

| Phase | Active Agents | Why this is the right size |
|---|---|---|
| Phase 1: MVP Authentication Hard Gate | A1 Core Fullstack Lead, A2 Frontend UI/Product Lead | Fastest path with minimal handoffs and no over-management |
| Phase 2: Expansion (history, analytics, account lifecycle) | A1, A2, **A3 QA/Release Lead** | Quality workload grows; dedicated QA prevents regressions |
| Phase 3: Optimization (subscriptions, OAuth, scale hardening) | A1, A2, A3, **A4 Platform/Scale Lead** | Infra/performance/security complexity justifies specialist ownership |

## Role Definitions

## A1 Core Fullstack Lead (Phase 1+)
Responsibilities:
- Backend architecture and API contracts
- DB schema/migrations/indexes
- Auth/session implementation (`register/login/logout/me`, cookie session security)
- Protected API enforcement (`requireAuth`)

Primary ownership:
- `backend/src/**`
- `backend/db/**`
- `docker-compose*.yml`

## A2 Frontend UI/Product Lead (Phase 1+)
Responsibilities:
- Public and protected route structure
- Login/register UX and auth bootstrap behavior
- Wizard/result/feedback flow UX
- Design consistency and reusable UI primitives

Primary ownership:
- `frontend/src/**`

## A3 QA/Release Lead (starts Phase 2)
Responsibilities:
- Automated test depth expansion (integration, E2E, visual)
- Regression ownership and release gate decisions
- Quality dashboard and defect triage ownership

Primary ownership:
- `backend/tests/**`
- `frontend/src/**/*.test.*`
- `e2e/**`
- CI test workflow files

## A4 Platform/Scale Lead (starts Phase 3)
Responsibilities:
- Performance, observability, and deployment hardening
- Subscription and entitlement infrastructure support
- OAuth provider abstraction hardening and operational reliability

Primary ownership:
- Infra/ops and platform hardening files added in Phase 3

## Ownership Boundaries and Coordination Rules

| Agent | Can change freely | Must coordinate before changing |
|---|---|---|
| A1 | Backend modules, DB schema, backend env/deploy config | Frontend UX structures, shared design primitives |
| A2 | Frontend routes, screens, UI components, styling system | API contracts and DB shape |
| A3 (Phase 2+) | Test suites, test configs, release checklists | Product behavior outside test scope |
| A4 (Phase 3+) | Infra/perf/security hardening surfaces | Product UX and business logic semantics |

## Dependency-Aware Delivery Plan

## Phase 1 (2 Agents Only): Authentication-First MVP
Build order:
1. A1 defines API contract + DB schema changes for auth/session
2. A2 implements route protection and auth UI against that contract
3. A1 locks backend auth endpoints and protected middleware
4. A2 connects protected wizard/result access to authenticated state

Parallelization:
- A1 and A2 work in parallel after contract draft is frozen.

Integration points:
- Contract checkpoint at start of week
- Mid-phase integration pass for `auth/me` + protected routes
- End-phase hard gate for unauthenticated denial paths

Phase 1 exit criteria:
- Unauthenticated user cannot access protected APIs/screens
- Register/login/logout/me stable
- Recommendation flow only available when authenticated

## Phase 2 (Add A3): Feature Expansion with Strong QA
Build scope:
- Saved history
- Analytics
- Account lifecycle improvements (verification/reset)
- Data release pipeline improvements

Parallelization:
- A1 backend/data features
- A2 frontend feature UX
- A3 builds regression packs and visual checks continuously

Phase 2 exit criteria:
- History and analytics function correctly
- Regression suite covers critical journeys
- Release decision formally documented by A3

## Phase 3 (Add A4): Optimization and Scale
Build scope:
- Subscription tiers and entitlements
- OAuth providers (Google/GitHub)
- Advanced recommendation retrieval upgrades
- Performance and operational hardening

Parallelization:
- A1 business/backend optimization
- A2 UX for entitlements/auth provider flows
- A3 release regression and risk gate
- A4 platform reliability and scale

Phase 3 exit criteria:
- Tier-based access reliable
- Multi-provider auth stable
- Performance and reliability gates met

## Testing Strategy (Progressive)

## Phase 1 (2 agents only)
A1 minimum test requirements:
- Unit: validators, auth/session helpers
- Integration: register/login/logout/me + `401` on protected endpoints

A2 minimum test requirements:
- Unit: route guard and auth state behavior
- Integration/UI: login/register errors, protected route redirect behavior
- E2E smoke: login -> wizard access -> logout -> blocked access

Merge rule in Phase 1:
- No PR merges without tests for changed logic
- Both agents must approve cross-boundary contract changes

## Phase 2 (with A3)
- Add broader E2E regression suite for core journeys
- Add visual regression on Landing/Login/Register/Wizard/Result
- A3 owns release gate (`Go` / `Go with Mitigations` / `No-Go`)

## Phase 3 (with A4)
- Add performance and reliability test gates
- Add auth provider matrix regression (local + OAuth)
- Add entitlement/authorization regression for subscription tiers

## UI/UX Quality Protection Plan

1. A2 is the single design coherence owner in all phases.
2. Shared UI primitives are introduced in Phase 1 and reused in all later phases.
3. Every UI-affecting PR includes desktop + mobile screenshots.
4. Visual regression checks become mandatory in Phase 2.
5. UX improvements must stay coherent: consistent typography, spacing, interaction states, and error/loading patterns.

## Code Review and Merge Workflow

Branch model:
- Protected `main`
- Feature branches: `codex/<agent>/<task>`

PR sequence:
1. Contract/schema changes
2. Backend/frontend feature implementation
3. Integration and polish

Review ownership:
- Phase 1: A1 and A2 cross-review integration-impacting PRs
- Phase 2+: A3 must approve release-critical changes
- Phase 3+: A4 must approve platform hardening changes

Safety checks:
- Required status checks expand by phase
- No direct pushes to `main`
- Phase exit criteria must be met before starting next phase

## Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Two-agent overload in Phase 1 | Keep Phase 1 scope strict to auth hard gate only |
| API/UI contract drift | Freeze contracts early and require cross-review for changes |
| Weak early testing without dedicated QA | Mandatory per-PR tests in Phase 1, then add A3 in Phase 2 |
| UI inconsistency as team expands | A2 remains single design owner across all phases |
| Late-stage platform instability | Add A4 in Phase 3 specifically for scale/reliability hardening |

## Final Recommendation

Start with **2 agents in Phase 1** for speed and low coordination overhead.
Add **A3 QA/Release** in Phase 2 when regression risk rises.
Add **A4 Platform/Scale** in Phase 3 when optimization and operational complexity justify specialization.
