# Phase 1 Recommendation Unlock API Contract

Date: 2026-03-10
Owner: Agent 1 (Backend Conversion-First Flow)

## Base
- Base URL: `/api`
- Auth model: anonymous wizard flow (no pre-auth login in Phase 1)
- Content type: `application/json`

## Endpoints

### `GET /api/health`
- Public
- Response `200`
```json
{
  "status": "ok",
  "mode": "database"
}
```

### `GET /api/profiles`
- Public
- Response `200`: profile array

### `GET /api/tasks`
- Public
- Response `200`: task array (`category` included)

### `GET /api/priorities`
- Public
- Response `200`: priority array

### `POST /api/recommendation/session`
- Public
- Rate limit: 30 req/min/IP
- Request
```json
{
  "profile_id": 1,
  "task_id": 4,
  "selected_priority": "Best quality",
  "wizard_duration_seconds": 21
}
```
- Response `201`
```json
{
  "session_id": 101,
  "created_at": "2026-03-10T16:00:00.000Z"
}
```
- Notes
  - Creates `recommendation_sessions` row with `user_id = NULL`.
  - `selected_priority` must be one of:
    - `Best quality`
    - `Fastest results`
    - `Easiest to use`
    - `Lowest price`

### `POST /api/recommendation/compute`
- Public
- Rate limit: 20 req/min/IP
- Request
```json
{
  "session_id": 101
}
```
- Response `200` (locked contract)
```json
{
  "session_id": 101,
  "recommendation_id": 9001,
  "primary_tool": {
    "tool_name": "Cursor",
    "locked": true
  },
  "alternative_tools": [
    {
      "tool_name": "GitHub Copilot",
      "context_word": "autocomplete"
    },
    {
      "tool_name": "Codeium",
      "context_word": "free tier"
    }
  ]
}
```
- Contract rules
  - Exactly 1 locked primary + exactly 2 alternatives.
  - Alternatives include only `tool_name` and `context_word`.
  - No raw scoring values in payload.

### `POST /api/recommendation/unlock`
- Public
- Rate limit: 10 req/min/IP
- Request
```json
{
  "session_id": 101,
  "recommendation_id": 9001,
  "email": "lead@example.com",
  "email_consent": true,
  "signup_source": "wizard"
}
```
- Response `200` (unlocked primary card)
```json
{
  "session_id": 101,
  "recommendation_id": 9001,
  "primary_tool": {
    "tool_name": "Cursor",
    "tool_slug": "cursor",
    "logo_url": "https://www.cursor.com/favicon.ico",
    "best_for": "AI-native IDE for full project development",
    "primary_reason": "Cursor is the best fit for write code when quality is what matters most.",
    "try_it_url": "https://www.cursor.com",
    "locked": false,
    "unlocked_at": "2026-03-10T16:01:00.000Z"
  }
}
```
- Behavior
  - Validates email and explicit consent.
  - Validates `recommendation_id` belongs to provided `session_id`.
  - Upserts `users` by case-insensitive email.
  - Links `recommendation_sessions.user_id` when still null.
  - Sets `recommendations.is_primary_locked = false` and `unlocked_at`.
  - Repeated unlock requests are idempotent.
  - `try_it_url` uses `referral_url` when available, otherwise `website`.

### `POST /api/recommendation/:id/feedback`
- Public
- Rate limit: 30 req/min/IP
- Request
```json
{
  "signal": 1
}
```
- Response `201`
```json
{
  "id": 77,
  "recommendation_id": 9001,
  "signal": 1,
  "created_at": "2026-03-10T16:02:00.000Z"
}
```
- Validation
  - `signal` must be `-1` or `1`.

### `POST /api/recommendation/:id/try-it-click`
- Public
- Rate limit: 30 req/min/IP
- Request
```json
{
  "session_id": 101
}
```
- Response `201`
```json
{
  "id": 42,
  "recommendation_id": 9001,
  "session_id": 101,
  "created_at": "2026-03-10T16:03:00.000Z"
}
```
- Behavior
  - Requires recommendation/session integrity (`recommendation_id` must belong to `session_id`).
  - Requires recommendation to be unlocked before tracking click.
  - Idempotent per recommendation/session pair.

## Deterministic Scoring
- Formula
```text
score = (quality * w_quality) + (speed * w_speed) + (ease_of_use * w_ease) + (pricing_fit * w_price)
```
- `pricing_fit` mapping
  - `free` -> `5`
  - `freemium` -> `4`
  - `paid_low` -> `3`
  - `paid_mid` -> `2`
  - `paid_high` -> `1`
  - missing/invalid -> `2`
- Priority weight profiles
  - `Best quality`: `0.5, 0.2, 0.2, 0.1`
  - `Fastest results`: `0.2, 0.5, 0.2, 0.1`
  - `Easiest to use`: `0.2, 0.2, 0.5, 0.1`
  - `Lowest price`: `0.1, 0.2, 0.2, 0.5`
- Tie-break order
  1. Priority-specific metric
  2. `target_users` contains selected profile
  3. alphabetical `tool_name`
- Category filtering and fallback
  - Start from selected task category.
  - Expand with phase-order fallback mapping.
  - If still below 3 candidates, fill from remaining active categories by score.

## Error Model
- `400` validation errors
- `404` missing session/recommendation/resource
- `429` rate limit exceeded
- `500` internal server error
