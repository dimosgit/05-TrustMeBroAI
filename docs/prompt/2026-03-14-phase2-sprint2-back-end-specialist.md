## 1. Feature Title
`Phase 2 Sprint 2 Back-End Specialist: History API, Funnel Metrics, and Recovery Enrollment Signal`

## 2. Objective
Implement the backend slice of Phase 2 Sprint 2 so authenticated users gain recommendation history, Phase 2 account/funnel behavior becomes measurable, and recovery-based sign-in correctly preserves the passkey-enrollment signal. Keep the anonymous recommendation flow stable and do not let recovery fallback become the primary auth path.

## 3. Context
- Product area: `Backend product foundation after passkey auth rollout`
- Current behavior: `Passkey-first auth foundation is implemented. Phase 2 Sprint 2 now needs authenticated history, measurable auth/account funnel signals, and mitigation closeout around recovery-based passkey enrollment.`
- Problem to solve: `Authenticated user value is still thin, the funnel is not measurable enough for Phase 2 decisions, and recovery verify must preserve the enrollment signal cleanly so frontend can guide users back to passkey-first posture.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
3. `docs/planning/2026-03-12-phase2-passkey-auth-api-contract.md`
4. `PROJECT_STATUS.md`

## 4. Scope
- In scope:
  1. Implement or finalize the authenticated recommendation history API.
  2. Add account/auth funnel metrics persistence or reporting inputs needed for Phase 2 analysis.
  3. Preserve and expose `requires_passkey_enrollment` correctly after recovery verify.
  4. Protect anonymous wizard, unlock, and passkey-first auth behavior from regression.
- Out of scope:
  1. Frontend history UI implementation.
  2. Full analytics dashboard UI.
  3. Editing `docs/planning/final-implementation-plan.md`.
  4. Password-based auth or auth model changes.

## 5. Requirements
1. Authenticated users must have a backend-supported way to retrieve recent unlocked recommendations.
2. History responses must be lightweight, stable, and limited to fields needed by the current frontend history experience.
3. Backend must persist or expose enough account/auth funnel data to measure key Phase 2 events without introducing noisy overengineering.
4. Recovery verify must preserve the `requires_passkey_enrollment` signal when appropriate so frontend can guide the user into passkey enrollment.
5. Anonymous wizard and unlock flows must remain operational and unchanged in core behavior.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep new backend behavior modular and aligned with existing auth and recommendation service boundaries.
3. Do not expose internal scoring details or leak unnecessary auth/account data.
4. Keep metrics foundation pragmatic:
   - capture useful events and reporting inputs
   - avoid building a full analytics system in this slice
5. Maintain parameterized SQL, existing validation discipline, and current security posture.

## 7. Implementation Notes
1. Favor a minimal authenticated history contract:
   - recommendation id
   - session id if needed for navigation
   - primary tool summary
   - reason
   - timestamps
   - lightweight task/priority context
2. Keep metrics event naming and storage consistent with existing tracking conventions already present in the app.
3. If metrics require schema work, keep it narrowly scoped and documented.
4. Verify that recovery verify and session bootstrap preserve the correct enrollment signal all the way to frontend consumption.
5. Add or update a short backend planning note under `docs/planning/` documenting:
   - final history API shape
   - metrics events or storage added
   - enrollment signal behavior

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - authenticated history success and auth-gated behavior
   - history empty-state or no-record handling at API level
   - recovery verify preserving `requires_passkey_enrollment`
   - metrics persistence or reporting-input creation for key Phase 2 events
   - anonymous flow non-regression where touched

## 9. Acceptance Criteria
1. Backend exposes a stable authenticated recommendation history API usable by the current Sprint 2 frontend.
2. Phase 2 account/auth funnel data is measurably persisted or exposed.
3. Recovery verify preserves `requires_passkey_enrollment` correctly.
4. Anonymous wizard/unlock behavior remains stable.

## 10. Deliverables
1. Backend code implementing history API, metrics foundation, and enrollment-signal hardening.
2. Test changes proving correctness and non-regression.
3. A short backend planning note under `docs/planning/`.
4. Short implementation summary including exact test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Frontend only needs a compact history payload for this slice, not a full account dashboard data model.
  2. Existing auth/session infrastructure is sufficient for protected history access once endpoints are in place.
- Open questions:
  1. Should metrics be stored in dedicated event rows, derived recommendation/account tables, or both?
