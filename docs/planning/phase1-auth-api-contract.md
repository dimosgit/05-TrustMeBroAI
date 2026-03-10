# Phase 1 Auth API Contract

Date: 2026-03-10
Owner: Agent 1 (Backend Auth Foundation)

## Base
- Base URL: `/api`
- Auth transport: cookie session (`HttpOnly` cookie name `tmb_session` by default)
- Content type: `application/json`

## Public Endpoints

### `GET /api/health`
- Auth: Public
- Response `200`
```json
{
  "status": "ok",
  "mode": "database"
}
```

### `POST /api/auth/register`
- Auth: Public
- Rate limit: 10 req/min/IP (configurable)
- Request body:
```json
{
  "email": "user@example.com",
  "password": "strongpassword",
  "email_consent": true,
  "signup_source": "landing"
}
```
- Validation:
  - `email` valid email format
  - `password` 8..128 chars
  - `email_consent` must be `true`
- Success `201`:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "email_consent": true,
    "consent_timestamp": "2026-03-10T12:00:00.000Z",
    "signup_source": "landing",
    "plan": "free",
    "subscription_status": "inactive",
    "created_at": "2026-03-10T12:00:00.000Z",
    "updated_at": "2026-03-10T12:00:00.000Z"
  }
}
```
- Error `400`: invalid payload
- Error `409`: duplicate email (case-insensitive)

### `POST /api/auth/login`
- Auth: Public
- Rate limit: 10 req/min/IP (configurable)
- Request body:
```json
{
  "email": "user@example.com",
  "password": "strongpassword"
}
```
- Success `200`: same response shape as register
- Error `400`: invalid payload
- Error `401`: invalid credentials

### `POST /api/auth/logout`
- Auth: Public (session cookie optional)
- Rate limit: 10 req/min/IP (configurable)
- Success `204` with cleared auth cookie

## Protected Endpoints
All endpoints below require a valid non-expired, non-revoked auth session cookie.
Unauthorized requests return `401` with:
```json
{
  "message": "Unauthorized"
}
```

### `GET /api/auth/me`
- Rate limit: 60 req/min/IP (configurable)
- Success `200`:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "email_consent": true,
    "consent_timestamp": "2026-03-10T12:00:00.000Z",
    "signup_source": "landing",
    "plan": "free",
    "subscription_status": "inactive",
    "created_at": "2026-03-10T12:00:00.000Z",
    "updated_at": "2026-03-10T12:00:00.000Z"
  }
}
```

### Catalog
- `GET /api/tools`
- `GET /api/tasks`
- `GET /api/profiles`
- `GET /api/priorities`
- Auth: Protected
- Success `200`: array payloads

### `POST /api/session`
- Rate limit: 30 req/min/IP (configurable)
- Request body:
```json
{
  "profile_id": 1,
  "task_id": 2,
  "budget": "Free only",
  "experience_level": "Beginner",
  "selected_priorities": ["Lowest price"]
}
```
- Success `201`:
```json
{
  "id": 10,
  "created_at": "2026-03-10T12:00:00.000Z"
}
```
- Ownership: session persisted with authenticated `user_id`

### `POST /api/recommendation`
- Rate limit: 20 req/min/IP (configurable)
- Request body:
```json
{
  "user_session_id": 10
}
```
- Success `200`:
```json
{
  "session_id": 10,
  "recommendation_id": 22,
  "primary_tool": {
    "id": 3,
    "name": "ChatGPT"
  },
  "alternative_tools": [
    {
      "id": 4,
      "name": "Claude"
    }
  ],
  "explanation": "..."
}
```
- Ownership enforcement: only the authenticated owner can use a `user_session_id`
- Error `404`: session not found or not owned

### `POST /api/recommendations/:id/feedback`
- Rate limit: 30 req/min/IP (configurable)
- Request body:
```json
{
  "signal": 1
}
```
- Success `201`:
```json
{
  "id": 1,
  "recommendation_id": 22,
  "user_id": 1,
  "signal": 1,
  "created_at": "2026-03-10T12:00:00.000Z"
}
```
- Ownership enforcement: only recommendation owner can submit feedback
- Error `400`: invalid `signal` (must be `-1` or `1`)
- Error `404`: recommendation not found or not owned

## Cookie Rules
- Cookie name: `SESSION_COOKIE_NAME` (default `tmb_session`)
- `HttpOnly`: always true
- `Secure`: true in production, false in development
- `SameSite`: `None` in production, `Lax` in development
- Session TTL: `SESSION_TTL_HOURS` (default `168` hours)

## Session Security Rules
- Passwords hashed with scrypt
- Session token stored only as SHA-256 hash in `auth_sessions.token_hash`
- Session validity requires:
  - token hash match
  - `revoked_at IS NULL`
  - `expires_at > NOW()`
