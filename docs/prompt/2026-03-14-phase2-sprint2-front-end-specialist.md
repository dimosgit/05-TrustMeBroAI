## 1. Feature Title
`Phase 2 Sprint 2 Front-End Specialist: History UI, English Copy Extraction, and Recovery Enrollment Guidance`

## 2. Objective
Implement the frontend slice of Phase 2 Sprint 2 so authenticated users can view recommendation history, active English copy is extracted cleanly for future localization, and recovery-based sign-in guides users back toward passkey-first posture. Preserve the current visual quality and keep the anonymous recommendation flow friction-light.

## 3. Context
- Product area: `Frontend product foundation after passkey auth rollout`
- Current behavior: `Passkey-first auth foundation is live. The next frontend slice adds visible authenticated value, prepares the app for future localization, and closes the recovery-based passkey-enrollment mitigation.`
- Problem to solve: `Authenticated accounts need visible value, current English copy still needs cleaner extraction for future i18n, and recovery sign-in must more clearly steer users back into passkey enrollment without degrading trust or UX clarity.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
3. `docs/planning/2026-03-12-phase2-passkey-front-end-ux-note.md`
4. `PROJECT_STATUS.md`

## 4. Scope
- In scope:
  1. Implement authenticated recommendation history UI.
  2. Extract active English UI copy into translation resources while preserving English output.
  3. Implement or finalize recovery-based passkey-enrollment guidance using backend enrollment-signal state.
  4. Preserve current quality of landing, wizard, result, and auth flows.
- Out of scope:
  1. Full multilingual rollout beyond English extraction readiness.
  2. Analytics dashboard UI.
  3. Editing `docs/planning/final-implementation-plan.md`.
  4. Broad redesigns unrelated to Sprint 2 scope.

## 5. Requirements
1. Authenticated users must have a usable history experience with empty, loading, error, and populated states.
2. Active English copy must be externalized into a maintainable translation-resource structure without changing the intended English UX.
3. Recovery-based sign-in must surface a clear passkey-enrollment next step when required.
4. Anonymous wizard and unlock flow must remain stable and easy to complete.
5. UI changes must preserve mobile usability and the product’s minimal, recommendation-first posture.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep i18n extraction pragmatic:
   - English only in this slice
   - clean key structure
   - no broad locale rollout
3. Do not introduce comparison-heavy UI or noisy account navigation.
4. Keep history UI lightweight, not a full dashboard.
5. Respect the existing visual language and avoid unnecessary churn.

## 7. Implementation Notes
1. Use the backend history contract from this batch rather than inventing frontend-only data assumptions.
2. Extract copy for active surfaces touched in the current app:
   - landing
   - wizard
   - unlock
   - result
   - auth
   - history
3. Preserve English rendering parity as a hard requirement, not a best effort.
4. Recovery-based passkey-enrollment guidance should feel supportive, not punitive or blocking.
5. If any current copy is clearly weak or placeholder-level, document that in a short frontend note without drifting into large marketing rewrites in this implementation pass.
6. Add or update a short frontend planning note under `docs/planning/` describing:
   - history UX behavior
   - i18n extraction coverage
   - recovery enrollment guidance behavior

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - authenticated history view states
   - English copy rendering parity after extraction
   - recovery-based passkey-enrollment guidance
   - anonymous flow non-regression where touched

## 9. Acceptance Criteria
1. Authenticated users can use a clean history UI.
2. Active English copy is extracted into translation resources without degrading English UX.
3. Recovery-based sign-in now clearly guides users toward passkey enrollment when required.
4. Anonymous recommendation flow remains stable and visually coherent.

## 10. Deliverables
1. Frontend code implementing history UI, English copy extraction, and enrollment guidance.
2. Test changes proving correctness and non-regression.
3. A short frontend planning note under `docs/planning/`.
4. Short implementation summary including exact test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend will provide a stable history contract early in the batch.
  2. English parity matters more than broad extraction coverage if a tradeoff appears.
- Open questions:
  1. Should history remain a dedicated page only, or should it also be reachable through a lightweight inline account entry point?
