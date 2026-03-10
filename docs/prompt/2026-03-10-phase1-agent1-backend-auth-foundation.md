## 1. Feature Title
`Phase 1 Agent 1: Backend Conversion-First Core`

## 2. Objective
Implement the backend exactly according to `docs/planning/final-implementation-plan.md` (Git source of truth): anonymous wizard session, deterministic recommendation compute, locked primary result, and consent-based email unlock. Deliver strict response contracts for locked/unlocked states and keep all logic deterministic and SQL-local.

## 3. Context
- Product area: `Backend API, services, repositories, PostgreSQL schema`
- Current behavior: `Legacy/transition code exists and may still contain non-final payload assumptions`
- Problem to solve: `Backend must enforce Phase 1 conversion-first flow with no pre-auth and exact contract shape`
- Known review findings to address immediately:
  1. Unlock path must validate `session_id` integrity, not only `recommendation_id`.
  2. Phase 1 KPI tracking evidence (wizard completion, unlock conversion, try-it CTR) is still insufficient for full `Go`.

## 4. Scope
- In scope:
  1. Align data model and repositories to final entities: `recommendation_sessions`, `recommendations`, `users`, `recommendation_feedback`, updated `tools` fields.
  2. Finalize endpoints:
     - `GET /api/profiles`
     - `GET /api/tasks`
     - `GET /api/priorities`
     - `POST /api/recommendation/session`
     - `POST /api/recommendation/compute`
     - `POST /api/recommendation/unlock`
     - `POST /api/recommendation/:id/feedback`
  3. Implement deterministic weighted scoring and tiebreak/fallback rules exactly as specified.
  4. Enforce locked/unlocked result payload contracts.
  5. Apply rate limits from final plan.
- Out of scope:
  1. Password auth or protected-app gating in MVP.
  2. Phase 2 login/history.
  3. Phase 3 subscriptions/entitlements.

## 5. Requirements
1. `POST /api/recommendation/session` creates anonymous session (`user_id` nullable before unlock).
2. `POST /api/recommendation/compute` returns locked primary + max 2 alternatives with `tool_name` + `context_word` only.
3. `POST /api/recommendation/unlock` validates email + consent, upserts user, links session to user, unlocks recommendation, returns full primary card payload.
4. `POST /api/recommendation/:id/feedback` accepts only `-1|1`.
5. Enforce input validation on email, consent, recommendation/session identifiers, and selected priority.
6. Never expose scoring numbers in UI-facing fields.
7. Never return more than 3 tools for result rendering.
8. `Try it ->` payload uses `referral_url` fallback to `website`.
9. `POST /api/recommendation/unlock` must validate `session_id` and ensure `recommendation_id` belongs to that session; reject mismatches.
10. Backend must provide measurable data for Phase 1 exit criteria:
   - wizard completion timing
   - unlock conversion
   - try-it click-through
11. Implement/confirm try-it click tracking path in a minimal MVP-safe way and document contract/use.

## 6. Technical Constraints
1. Node.js + Express + PostgreSQL only.
2. Parameterized SQL only.
3. Keep scoring deterministic and SQL-local.
4. Keep modular boundaries: `session-service`, `recommendation-service`, `lead-capture-service`, `result-service`.
5. Do not change frontend source except contract coordination docs.

## 7. Implementation Notes
1. Keep/update API contract doc at `docs/planning/phase1-recommendation-unlock-api-contract.md`.
2. Ensure unlock path validates relationship integrity (recommendation belongs to session used for unlock).
3. Ensure indexes required by final plan are present.
4. Keep DB scripts idempotent.
5. Add/confirm minimal non-breaking instrumentation for Phase 1 KPI evidence.
6. Preserve and keep the integration-specialist unlock payload compatibility (`try_it_url`, nested `primary_reason`) for frontend interoperability.

## 8. Test Requirements
1. Add/update automated tests for all changed behavior.
2. Run checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Anonymous flow works without login.
2. Locked/unlocked payloads match final contract.
3. Scoring and tie-break behavior match final spec.
4. Rate limits and validation behavior match final spec.
5. Feedback endpoint enforces valid signal values.
6. Unlock rejects session/recommendation mismatches with deterministic validation errors.
7. KPI tracking data is queryable and sufficient to evaluate Phase 1 exit criteria.

## 10. Deliverables
1. Backend code + DB changes aligned to final plan.
2. Updated backend tests with pass results.
3. Updated API contract doc.
4. Short implementation summary with exact commands/results.
5. Short KPI instrumentation note: where each required metric is emitted/stored and how to query it.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Git `docs/planning/final-implementation-plan.md` is final and authoritative.
- Open questions:
  1. If additional KPI tracking endpoints are required, confirm minimal API shape before implementation.
