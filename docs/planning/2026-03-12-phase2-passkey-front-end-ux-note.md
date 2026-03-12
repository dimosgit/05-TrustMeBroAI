# Phase 2 Frontend UX Note: Passkey-First Account Flow (2026-03-12)

Source of truth kept unchanged:
- `docs/planning/final-implementation-plan.md`

## Implemented UX decisions
1. Account entry remains a single `Account` action in the header to avoid CTA crowding.
2. `Register` and `Login` screens are now passkey-first and explicitly describe passwordless sign-in.
3. Email is still the account identifier on both passkey screens.
4. Email fallback is available through a dedicated `Recovery` screen and is presented as secondary.
5. Recovery verification is routed through a dedicated recovery verify page and then returns users to their redirect target.

## User flow summary
1. Anonymous user can still start the wizard without auth friction.
2. User opens `Account` and chooses register or sign-in with passkey.
3. Frontend obtains passkey options, runs WebAuthn browser ceremony, and verifies with backend.
4. Successful verify updates auth context and redirects to requested route.
5. If passkeys are unavailable on the device/browser, user can use explicit email recovery fallback.

## Stability and non-regression intent
1. Result unlock and wizard UX remain unchanged in behavior.
2. Auth bootstrap via `/api/auth/me` continues to define signed-in chrome state.
3. Logout behavior remains deterministic even on backend failures.
