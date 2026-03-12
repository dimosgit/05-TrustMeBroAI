# Phase 2 Auth API Contract (Magic-Link)

Date: 2026-03-11
Owner: Backend
Scope: Explicit register + returning-user login using passwordless magic links.

## Endpoints

### `POST /api/auth/register`
Purpose: create or upgrade an explicit account and send a one-time magic link.

Request:
```json
{
  "email": "user@example.com",
  "email_consent": true,
  "signup_source": "register_page"
}
```

Response `202`:
```json
{
  "message": "If the email is valid, you will receive a link."
}
```

Behavior notes:
- Requires valid email and `email_consent === true`.
- Idempotent on existing email.
- Upgrades unlock-created users to explicit registered users (`registered_at` set once).
- Response is generic and non-enumerating.

### `POST /api/auth/login/request`
Purpose: request login magic link for returning registered users.

Request:
```json
{
  "email": "user@example.com"
}
```

Response `202`:
```json
{
  "message": "If the email is valid, you will receive a link."
}
```

Behavior notes:
- Generic response for both existing and non-existing/unregistered emails.
- Does not leak account existence.

### `POST /api/auth/login/verify`
Purpose: consume one-time magic-link token and create auth session cookie.

Request:
```json
{
  "token": "opaque-token"
}
```

Response `200`:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

Error `401`:
```json
{
  "message": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

Behavior notes:
- Token hash is stored at rest (`SHA-256`).
- Token is short-lived (`AUTH_MAGIC_LINK_TTL_MS`, default 15m).
- Token is one-time-use (`used_at` set atomically).
- Successful verify updates `last_login_at` and sets `HttpOnly` session cookie.

### `GET /api/auth/me`
Purpose: return authenticated user.

Response `200`:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

Error `401`:
```json
{
  "message": "Unauthorized"
}
```

### `POST /api/auth/logout`
Purpose: revoke current auth session and clear cookie.

Response `204` with cleared auth cookie.

## Session and Cookie Rules
- Session token stored only as `SHA-256` hash in `auth_sessions.token_hash`.
- Cookie: `HttpOnly`, `SameSite=Lax` in non-production, `SameSite=None; Secure` in production.
- Logout revokes session (`revoked_at`) and clears cookie.

## Rate Limits
- Auth limiter applies to:
  - `POST /api/auth/register`
  - `POST /api/auth/login/request`
  - `POST /api/auth/login/verify`
  - `POST /api/auth/logout`
- `GET /api/auth/me` uses dedicated `authMe` limiter.

## Data Model Additions
- `users.registered_at TIMESTAMP NULL`
- `users.last_login_at TIMESTAMP NULL`
- `auth_magic_links`:
  - `id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `user_agent`, `ip_address`, `flow`, `created_at`

## Delivery Provider Configuration
- `AUTH_MAGIC_LINK_PROVIDER`
  - `console` for local/dev-only
  - `resend` for production rollout
- `AUTH_MAGIC_LINK_BASE_URL` (frontend verify route, e.g. `https://app.example.com/auth/verify`)
- `AUTH_MAGIC_LINK_TTL_MS` (default `900000` = 15 minutes)
- `AUTH_MAGIC_LINK_RESEND_API_KEY` (required when provider is `resend`)
- `AUTH_MAGIC_LINK_FROM_EMAIL` (required when provider is `resend`)
- `AUTH_MAGIC_LINK_FROM_NAME` (optional; defaults to `TrustMeBroAI`)

## Runtime Safety Rules
- Production startup fails fast if `AUTH_MAGIC_LINK_PROVIDER=console`.
- Provider misconfiguration (missing required env) fails fast during app initialization.
- Plaintext tokens are sent only to the delivery provider and are never stored in DB logs/state.
- At rest, only `SHA-256` token hashes are persisted (`auth_magic_links.token_hash`).

## Rollout Verification Steps
1. Start backend in production-like mode with `AUTH_MAGIC_LINK_PROVIDER=resend` and valid credentials.
2. Call `POST /api/auth/register` with a test mailbox and verify mail delivery.
3. Call `POST /api/auth/login/request` for the same user and verify delivery again.
4. Verify one-time semantics:
   - first `POST /api/auth/login/verify` succeeds
   - second verify with same token fails `401`
5. Verify rate limits:
   - repeated auth calls above threshold return `429` with `Retry-After`.
