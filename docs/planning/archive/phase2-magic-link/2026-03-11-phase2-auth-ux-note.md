# Phase 2 Auth UX Note (Frontend)

Date: 2026-03-11
Owner: Front-End Specialist

## Interaction Summary
- Global header now exposes explicit account entry points:
  - Unauthenticated: `Register`, `Login`, `Start Wizard`
  - Authenticated: signed-in email label + `Logout` + `Start Wizard`
- New routes:
  - `/register`: email + consent form, then "Check your email" confirmation
  - `/login`: email form, then "Check your email" confirmation
  - `/auth/verify`: magic-link callback processing
- Anonymous recommendation funnel remains unchanged:
  - `/wizard` is still accessible without login
  - unlock email gate still works for anonymous users
- Register/login success states use generic non-enumerating copy:
  - "If the email is valid, a sign-in link has been sent..."

## Session Bootstrap and Persistence
- On app load, frontend bootstraps auth state via `GET /api/auth/me`.
- Cookie-backed session survives refresh by rehydrating auth state from `auth/me`.
- Logout calls `POST /api/auth/logout` and clears frontend auth state immediately.

## Verify Route Behavior
- `token` is read from `/auth/verify?token=...`.
- Optional `redirect` query is sanitized to internal app paths only.
- Success path:
  - finalize login state
  - emit `verify_success`
  - redirect to sanitized target (default `/wizard`)
- Failure path:
  - show actionable error and retry CTA
  - emit `verify_failure`

## Post-Unlock Account Callout
- In unlocked result state, anonymous users see:
  - "Create an account to save and return later."
  - direct links to register/login
  - prefilled email in links when unlock email is known
- This callout is non-blocking and does not interrupt `Try it ->` conversion behavior.

## Fallback States
- Register/login submit failures show inline recoverable errors.
- Verify failures show clear retry path to `/login`.
- Timeout/network/5xx failures on register/login/verify normalize to `Server is unavailable. Please try again.`
- Logout is optimistic on frontend: UI switches to signed-out state immediately even if backend logout fails.

## Known Mitigations (Rollout)
- If `/api/auth/login/request` or `/api/auth/login/verify` is unavailable during rollout, users get inline recoverable errors and can retry later.
- Auth bootstrap (`/api/auth/me`) failures do not block wizard start; anonymous funnel remains usable via `Start Wizard`.
