## 1. Feature Title
`Phase 1 Agent 1: Backend Conversion-First Recommendation + Email Unlock`

## 2. Objective
Implement the Phase 1 backend exactly as defined in `docs/planning/final-implementation-plan.md` from Git: anonymous wizard flow first, locked primary recommendation, and consent-aware email unlock. Deliver deterministic SQL-local recommendation logic and response contracts that support minimal-cognitive-load UI. Do not introduce pre-auth/login gating in MVP.

## 3. Context
- Product area: `Backend API + PostgreSQL data model for anonymous recommendation and unlock`
- Current behavior: `Legacy MVP endpoints/schema are not aligned to conversion-first locked/unlock flow`
- Problem to solve: `Need strict Phase 1 backend contract for anonymous session -> compute -> email unlock`

## 4. Scope
- In scope:
  1. Align DB schema to Phase 1 entities and relationships: `recommendation_sessions`, `recommendations`, `users`, `recommendation_feedback` (+ required tool fields).
  2. Implement modular backend services: `session-service`, `recommendation-service`, `lead-capture-service`, `result-service`.
  3. Implement API endpoints:
     - `GET /api/profiles`
     - `GET /api/tasks`
     - `GET /api/priorities`
     - `POST /api/recommendation/session`
     - `POST /api/recommendation/compute`
     - `POST /api/recommendation/unlock`
     - `POST /api/recommendation/:id/feedback`
  4. Implement deterministic scoring formula, filtering rules, fallback category expansion, and tiebreakers from plan.
  5. Enforce locked/unlocked response contracts and rate limits for Phase 1 endpoints.
  6. Seed curated tools (20-30 target) with required scoring/display fields.
- Out of scope:
  1. Password auth, protected app areas, or pre-wizard login.
  2. Phase 2 features (magic-link login, saved history, advanced analytics dashboards).
  3. Phase 3 features (subscriptions/entitlements).

## 5. Requirements
1. MVP access model must remain anonymous before unlock. Do not add login/password requirements to wizard or compute flow.
2. `POST /api/recommendation/session` must create anonymous `recommendation_sessions` row with `profile_id`, `task_id`, `selected_priority`, optional `wizard_duration_seconds`, and `user_id=NULL` until unlock.
3. `POST /api/recommendation/compute` must create recommendation data and return locked payload shape:
   - `session_id`
   - locked `primary_tool` metadata (`locked=true`)
   - exactly 2 `alternative_tools`, each only `tool_name` + `context_word`
4. `POST /api/recommendation/unlock` must validate `email` + explicit consent, upsert/create user, link `recommendation_sessions.user_id`, unlock recommendation, and return full primary card payload.
5. `POST /api/recommendation/:id/feedback` must accept only `signal` in `-1|1` and persist.
6. Never return more than 3 tools in UI-facing result payloads.
7. Never expose raw scoring numbers in UI-facing fields.
8. `Try it ->` destination payload must prefer `referral_url` when present, fallback to `website`.
9. Add case-insensitive unique email enforcement and required indexes from plan.
10. Apply rate limits:
   - session: 30 req/min/IP
   - compute: 20 req/min/IP
   - unlock: 10 req/min/IP
   - feedback: 30 req/min/IP

## 6. Technical Constraints
1. Use Node.js + Express + PostgreSQL only; keep modular boundaries and parameterized SQL only.
2. Keep scoring deterministic and SQL-local; no external model/API dependency in MVP.
3. Preserve strict UI contract behavior in API responses (locked primary, two minimal alternatives, no comparison payload bloat).
4. Treat `docs/planning/final-implementation-plan.md` in Git as single source of truth; do not invent alternate product logic.
5. Do not modify frontend source code beyond unavoidable contract documentation artifacts.

## 7. Implementation Notes
1. Create/update backend contract doc at `docs/planning/phase1-recommendation-unlock-api-contract.md` with exact request/response examples.
2. Implement scoring exactly per plan:
   - base formula using `quality`, `speed`, `ease_of_use`, `pricing_fit`
   - priority-specific weights
   - tie-breaker order
   - category filtering and ordered fallback expansion
3. Implement `primary_reason` template generation exactly per plan with priority-context mapping.
4. Keep `context_word` as source for alternative preview; if empty, return empty/missing, do not fabricate text.
5. Handle edge cases: invalid priority, missing category candidates, invalid consent input, duplicate email, repeated unlock requests.
6. Ensure schema/init scripts are idempotent and safe for repeated local/prod bootstrap.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint` (add script/config if missing)
   - Type check: `cd backend && npm run typecheck` (add script if missing)
   - Unit/integration tests: `cd backend && npm run test && npm run test:integration` (add scripts if missing)
3. Include deterministic scoring test vectors for each selected priority + tie-break paths.
4. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Anonymous user can complete session + compute without login.
2. Compute response is locked and returns at most 3 tools (1 primary locked + 2 alternatives with minimal fields).
3. Unlock flow upserts user with consent fields, links session, unlocks primary recommendation, and returns full primary payload.
4. Feedback endpoint stores valid `-1|1` signals only.
5. No UI-facing payload exposes raw scoring numbers.
6. Tests prove scoring formula correctness and endpoint contract compliance.

## 10. Deliverables
1. Backend code changes implementing Phase 1 conversion-first flow.
2. DB/schema/seed updates aligned to final plan.
3. Automated tests proving endpoint, scoring, and unlock behavior.
4. `docs/planning/phase1-recommendation-unlock-api-contract.md` with finalized contracts.
5. Short implementation summary with exact command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not implement pre-auth/protected-area MVP behavior; that is explicitly Phase 2.
6. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. The Git version of `docs/planning/final-implementation-plan.md` is final and authoritative.
  2. Existing code can be refactored/replaced where needed to satisfy final contract shape.
- Open questions:
  1. If follow-the-build capture is implemented now, should it reuse unlock storage path with dedicated `signup_source`, or wait for a dedicated endpoint?
