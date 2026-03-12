## 1. Feature Title
`Phase 2 Sprint 2 Front-End Specialist: History UI, I18n Extraction, and Recovery Enrollment Nudge`

## 2. Objective
Implement the frontend side of Phase 2 Sprint 2 by adding authenticated recommendation history UI, extracting active English copy into translation resources, and closing the current passkey mitigation around post-recovery enrollment guidance. Keep the app visually strong, minimal, and conversion-safe.

## 3. Context
- Product area: `Frontend product foundation after passkey auth rollout`
- Current behavior: `Passkey-first auth foundation is implemented and approved. The next frontend slice is history, i18n groundwork, and recovery mitigation closeout.`
- Problem to solve: `Authenticated users need visible value from their account, English copy is still too hardcoded, and recovery-based sign-in needs to guide users back toward passkey-first posture.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
3. `docs/planning/2026-03-12-phase2-passkey-front-end-ux-note.md`

## 4. Scope
- In scope:
  1. Implement authenticated recommendation history UI.
  2. Extract active English UI copy into translation resources.
  3. Preserve English UX behavior after extraction.
  4. Expose `requires_passkey_enrollment` after recovery verify and show a guided enrollment nudge.
  5. Preserve auth and anonymous funnel stability.
- Out of scope:
  1. Full multilingual rollout beyond extraction and English parity.
  2. Analytics dashboard UI.
  3. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. Authenticated users must be able to see and use a lightweight history view of past recommendations.
2. English copy extraction must not degrade current UX or content clarity.
3. Recovery-based sign-in must guide the user back toward passkey enrollment when required.
4. Header/navigation simplicity and conversion-first behavior must be preserved.
5. Anonymous wizard and unlock flow must remain friction-light.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep i18n extraction scoped and pragmatic:
   - active English source locale only
   - no big-bang multilingual rollout
3. Do not reintroduce noisy navigation or comparison-heavy UI.
4. Preserve mobile-safe layout behavior.

## 7. Implementation Notes
1. Build a lightweight history UI, not a heavy account dashboard.
2. Extract active user-facing copy into translation resources with a clear key structure.
3. Keep English as the default/source locale.
4. After recovery verify, preserve the backend `requires_passkey_enrollment` signal in frontend state and present a clear next-step enrollment nudge.
5. Keep the enrollment nudge helpful and secondary, not punitive or blocking.
6. If copy extraction touches auth, landing, result, or wizard surfaces, keep visual output effectively unchanged in English.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - history view render and empty/non-empty states
   - English copy still rendering correctly after extraction
   - post-recovery passkey enrollment nudge behavior
   - anonymous flow non-regression

## 9. Acceptance Criteria
1. Authenticated users have a usable history UI.
2. Active English copy is externalized and unchanged in behavior/content quality.
3. Recovery-based sign-in now guides users toward passkey enrollment when required.
4. Anonymous wizard and unlock flow remain stable and visually clean.

## 10. Deliverables
1. Frontend code changes implementing history UI, i18n extraction groundwork, and enrollment nudge.
2. Test changes proving correctness and non-regression.
3. A short frontend UX/update note under `docs/planning/`.
4. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend will expose a stable first history API contract for this slice.
- Open questions:
  1. Should history live under a dedicated page, or as a lightweight authenticated section anchored from the account entry point?
