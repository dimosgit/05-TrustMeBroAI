# Authenticated User Primary Recommendation Regression (2026-03-12)

## Risk Summary
- Risk tier: `High`
- Area: `Auth + result unlock integration`
- User impact: `A logged-in user still sees the primary recommendation locked, which makes the auth value proposition feel broken and undermines trust in register/login.`
- Immutable source of truth respected: `docs/planning/final-implementation-plan.md` was not modified.

## Test Plan
1. Reproduce with a user who is already authenticated.
2. Navigate through the wizard to a locked result.
3. Confirm whether the primary recommendation auto-unlocks for the logged-in user.
4. Review FE and BE unlock integration surfaces for gating logic.

Assumptions:
1. The user report reflects current runtime behavior in the active environment.
2. Authentication itself may be succeeding, but result unlock integration is not honoring that state.

Untested areas:
1. Cross-browser confirmation of the same bug.
2. Whether the bug reproduces only for login-created sessions, or also for users who first unlocked and later return.

## Execution Results
### Reported Reproduction
1. User logs in successfully.
2. User proceeds through the recommendation flow.
3. Primary recommendation remains hidden/locked.
4. Expected behavior: authenticated returning users should not need to re-enter email in order to reveal the primary recommendation.

### Relevant Code Evidence
1. [ResultPage.jsx](/Users/dimouzunov/00%20Coding/05%20TrustMeBroAI/05-TrustMeBroAI/frontend/src/features/result/ResultPage.jsx)
- The auto-unlock effect checks `hasRegisteredUnlockMarker()` before attempting unlock.
- It does not use `isAuthenticated` as the condition for auto-unlock.

2. [recommendationRoutes.js](/Users/dimouzunov/00%20Coding/05%20TrustMeBroAI/05-TrustMeBroAI/backend/src/routes/recommendationRoutes.js)
- Backend supports remembered-user unlock when a valid auth session exists and no email is provided:
  - `isRememberedUserUnlock = !hasProvidedEmail && Boolean(req.user?.email)`
- This suggests the backend path exists, but the frontend is not reliably invoking it for every authenticated user.

3. [recommendationApi.js](/Users/dimouzunov/00%20Coding/05%20TrustMeBroAI/05-TrustMeBroAI/frontend/src/lib/api/recommendationApi.js)
- `unlockRecommendation()` already supports calling unlock without email payload.
- This aligns with the backend remembered-user path.

### Current Hypothesis
1. This is primarily a front-end integration regression.
2. The result page appears to treat `registered_unlock` local storage as the gate for remembered unlock, instead of authenticated session state.
3. A user can therefore be logged in, but still fail the FE auto-unlock condition and remain blocked behind the hidden primary card.

## Release Decision
- Verdict: `No-Go` for treating auth as complete or credible

Rationale:
1. The user-facing promise of “log in so you do not have to re-enter email” is currently broken.
2. This damages both product trust and the perceived value of registration/login.
3. The issue appears to affect a core conversion-critical flow rather than a peripheral edge case.

## Ownership and Next Action
1. Primary owner: `Front-End Specialist`
- Fix the auto-unlock trigger so authenticated users are handled correctly.

2. Secondary owner: `Back-End Specialist`
- Confirm the remembered-user unlock contract is stable and returns the expected payload for authenticated sessions.

3. Validation owner: `QA Specialist`
- Add a manual and automated regression case:
  - authenticated user -> wizard -> locked result -> auto-unlock without re-entering email
