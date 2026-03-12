# Phase 2 Sprint 2 Frontend UX Update Note (2026-03-12)

Source of truth kept unchanged:
- `docs/planning/final-implementation-plan.md`

## Scope Delivered
1. Added authenticated recommendation history UI with empty/non-empty/error states.
2. Extracted active English frontend copy into source locale resources (`en`) with parity-preserving rendering.
3. Preserved and exposed recovery verify `requires_passkey_enrollment` and added a guided enrollment nudge.
4. Added a passkey enrollment path for authenticated recovery users so the nudge is actionable.
5. Preserved anonymous funnel behavior and auth stability.

## Frontend Changes
1. History foundation:
- New route: `/history`
- New page: `frontend/src/features/history/HistoryPage.jsx`
- New API client method: `fetchRecommendationHistory` in `frontend/src/lib/api/recommendationApi.js`
- Authenticated header now includes lightweight `History` entry.

2. Recovery enrollment mitigation closeout:
- `verifyRecoveryAuth` now returns `{ user, requiresPasskeyEnrollment }`.
- Auth state now preserves dismissal-aware passkey enrollment requirement in session storage.
- App shell shows a non-blocking enrollment nudge after recovery verify when required.
- Register page supports authenticated `enroll=1` mode to add passkey after recovery sign-in.

3. i18n extraction groundwork:
- Added locale dictionary: `frontend/src/lib/i18n/locales/en.js`
- Added translator helper: `frontend/src/lib/i18n/index.js`
- Wired active copy through translations across landing, wizard, result/unlock, auth, shell, and history surfaces.
- English output remains unchanged in wording and behavior.

## Test Coverage Added/Updated
1. Added `frontend/src/test/auth-phase2-sprint2.test.jsx` for:
- history unauthenticated prompt
- history empty state
- history non-empty state and open-result action
- post-recovery passkey enrollment nudge
- English copy parity smoke

2. Updated `frontend/src/test/auth-api.test.js` to validate new recovery verify payload shape.

## Required Commands and Results
1. `cd frontend && npm run lint` -> PASS
2. `cd frontend && npm run build` -> PASS
3. `cd frontend && npm run test` -> PASS (`40/40`)
4. `cd frontend && npm run test:e2e:smoke` -> PASS (`1/1`)

## Notes
1. History UI is resilient to backend unavailability via explicit error state and retry action.
2. No changes were made to `docs/planning/final-implementation-plan.md`.
