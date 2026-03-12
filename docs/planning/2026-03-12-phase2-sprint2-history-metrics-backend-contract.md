# Phase 2 Sprint 2 Backend Contract: History + Funnel Metrics

Date: 2026-03-12  
Scope: backend-only API and persistence additions for authenticated recommendation history and funnel/account events.

## 1. Authenticated History API

### `GET /api/recommendation/history`
- Auth required (`/api/auth` session cookie).
- Query params:
  - `limit` (optional, default `20`, max `100`)
  - `offset` (optional, default `0`)
- Response:
```json
{
  "items": [
    {
      "recommendation_id": 101,
      "session_id": 55,
      "selected_priority": "Best quality",
      "task_name": "Analyze a PDF",
      "profile_name": "Business",
      "locked": false,
      "primary_reason": "Recommended for your selected priority.",
      "unlocked_at": "2026-03-12T13:00:00.000Z",
      "created_at": "2026-03-12T12:58:00.000Z",
      "try_it_clicked": true,
      "primary_tool": {
        "id": 1,
        "tool_name": "ChatGPT",
        "tool_slug": "chatgpt",
        "logo_url": "https://cdn.simpleicons.org/openai",
        "try_it_url": "https://chatgpt.com"
      }
    }
  ],
  "limit": 20,
  "offset": 0
}
```

### `GET /api/recommendation/history/:id`
- Auth required.
- User-scoped: recommendation must belong to authenticated user (`recommendation_sessions.user_id`).
- Response extends history item with:
  - `alternative_tools` (up to 2, ordered)
- Cross-user access returns `404`.

## 2. User Ownership Semantics

History ownership is resolved by:
1. `recommendation_sessions.user_id`
2. Linking behavior from unlock flow (`leadCaptureService + sessionRepository.linkSessionToUser`)
3. Authenticated identity from session cookie middleware (`requireAuth`)

No cross-user recommendation history data is returned.

## 3. Funnel Event Persistence

New backend table: `funnel_events`

Persisted event names:
1. `account_created`
2. `sign_in_completed`
3. `recommendation_unlocked`
4. `try_it_clicked`

Primary emit points:
1. `POST /api/auth/passkey/register/verify` -> `account_created`
2. `POST /api/auth/passkey/login/verify` and `POST /api/auth/recovery/verify` -> `sign_in_completed`
3. `POST /api/recommendation/unlock` -> `recommendation_unlocked`
4. `POST /api/recommendation/:id/try-it-click` -> `try_it_clicked`

Event metadata is stored as JSONB for future dashboard/reporting expansion.

## 4. Non-Regression Expectations

1. Anonymous recommendation session/compute/unlock remains available.
2. Auth/session behavior remains passkey-first with recovery fallback.
3. History endpoints reject unauthenticated access with `401`.
