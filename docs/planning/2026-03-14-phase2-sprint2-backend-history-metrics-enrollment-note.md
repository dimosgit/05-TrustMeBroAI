# Phase 2 Sprint 2 Backend Note (2026-03-14)

## Scope closed in this slice
1. Authenticated recommendation history API is available and auth-gated.
2. History listing/detail is user-scoped and returns unlocked recommendations only.
3. Funnel/account events are persisted to `funnel_events` for:
   - `account_created`
   - `sign_in_completed`
   - `recommendation_unlocked`
   - `try_it_clicked`
4. Recovery verify keeps passkey enrollment guidance signal intact via:
   - `requires_passkey_enrollment: true` when no active passkey
   - `requires_passkey_enrollment: false` when at least one active passkey exists

## API summary
1. `GET /api/recommendation/history`
2. `GET /api/recommendation/history/:id`
3. Existing `POST /api/auth/recovery/verify` contract preserved and signal behavior explicitly tested.

## Non-regression posture
1. Anonymous session/compute/unlock flows remain active.
2. Passkey-first auth model remains primary.
3. Recovery fallback remains secondary and instrumented.
