## 1. Feature Title
`Phase 1 Integration Checkpoint: Anonymous Wizard + Email Unlock Contract`

## 2. Objective
Run a strict integration checkpoint after parallel Agent 1 (backend) and Agent 2 (frontend) work to ensure Phase 1 conversion-first behavior matches `docs/planning/final-implementation-plan.md` from Git exactly. Validate anonymous wizard flow, locked primary result, email+consent unlock, and minimal-cognitive-load UI contract before merge.

## 3. Context
- Product area: `Phase 1 conversion-first integration`
- Current behavior: `Backend and frontend were developed in parallel and need contract verification`
- Problem to solve: `Prevent drift from final plan and block incorrect auth-gated/compare-heavy behavior`

## 4. Scope
- In scope:
  1. Validate API contract and payload compatibility for session/compute/unlock/feedback endpoints.
  2. Validate full user journey: landing -> wizard -> locked result -> unlock -> unlocked primary -> try-it.
  3. Fix integration defects that violate final plan contract.
  4. Validate key non-functional constraints (tool count limits, score hiding, unlock behavior).
- Out of scope:
  1. Phase 2 features (returning-user login/history).
  2. Phase 3 features (subscriptions/entitlements/advanced retrieval).

## 5. Requirements
1. Confirm no pre-auth/login requirement exists in MVP wizard path.
2. Confirm endpoint set matches plan:
   - `GET /api/profiles`
   - `GET /api/tasks`
   - `GET /api/priorities`
   - `POST /api/recommendation/session`
   - `POST /api/recommendation/compute`
   - `POST /api/recommendation/unlock`
   - `POST /api/recommendation/:id/feedback`
3. Confirm locked response contract:
   - locked primary
   - max 2 alternatives
   - alternatives limited to `tool_name` + `context_word`
4. Confirm unlock requires valid email + explicit consent and then returns full primary card payload.
5. Confirm UI renders max 3 tools total and never displays internal scoring values.
6. Confirm `Try it ->` opens `referral_url` when present, otherwise `website`.
7. Confirm feedback endpoint stores valid `-1|1` signals only.

## 6. Technical Constraints
1. Use Git `docs/planning/final-implementation-plan.md` as the only source of truth.
2. Keep fixes integration-focused; no unplanned feature expansion.
3. Do not bypass failing tests; fix or escalate with clear blocker evidence.

## 7. Implementation Notes
1. Compare backend response payloads to frontend consumption field-by-field.
2. Verify scoring outputs are deterministic but hidden from UI-facing fields.
3. Prioritize fixes in this order:
   - plan-contract violations
   - conversion-path blockers
   - UX regressions that increase cognitive load
4. Document any mismatch with exact request/response examples and resolution.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint` and `cd frontend && npm run lint`
   - Type check/build: `cd backend && npm run typecheck` and `cd frontend && npm run build`
   - Unit/integration/e2e tests: `cd backend && npm run test && npm run test:integration` and `cd frontend && npm run test && npm run test:e2e:smoke`
3. Include integration checks for:
   - anonymous access allowed for wizard start/compute path
   - unlock-gated primary reveal
   - max-3-tools rule
   - no score leakage to UI
4. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. End-to-end anonymous-to-unlock flow passes locally.
2. Locked and unlocked result contracts match final plan exactly.
3. No unresolved P0/P1 plan-contract defects remain.
4. Integration report includes command results and final merge recommendation.

## 10. Deliverables
1. Integration fixes required to align backend/frontend with final plan.
2. Updated tests covering discovered integration failure modes.
3. Integration checkpoint report containing:
   - commands executed
   - pass/fail outcomes
   - defects fixed
   - open blockers (if any)
   - final decision: `Go` / `Go with Mitigations` / `No-Go`

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Reject any implementation that introduces pre-auth MVP gating or comparison-heavy UI.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Agent 1 and Agent 2 implementations are available for integration test pass.
  2. Test scripts may need to be added where currently missing.
- Open questions:
  1. Should landing “follow the build” capture be required in this checkpoint or tracked as a separate post-checkpoint task if backend endpoint is not yet finalized?
