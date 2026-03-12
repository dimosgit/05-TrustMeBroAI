# Phase 2 Passkey-First Auth API Contract (Backend)

Date: 2026-03-12  
Scope: backend contract for passkey-first account access with email fallback recovery/bootstrap.

## 1. Endpoints

### 1. `POST /api/auth/passkey/register/options`
Purpose: start passkey registration for an email identity.

Request body:
```json
{
  "email": "user@example.com",
  "email_consent": true,
  "signup_source": "register_page"
}
```

Response `200`:
```json
{
  "challenge_id": 123,
  "public_key": {
    "...": "WebAuthn creation options JSON"
  }
}
```

### 2. `POST /api/auth/passkey/register/verify`
Purpose: verify passkey attestation, persist credential, issue authenticated session cookie.

Request body:
```json
{
  "challenge_id": 123,
  "credential": {
    "...": "WebAuthn registration credential response"
  }
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

### 3. `POST /api/auth/passkey/login/options`
Purpose: start passkey authentication challenge.

Request body:
```json
{
  "email": "user@example.com"
}
```

Response `200`:
```json
{
  "challenge_id": 456,
  "public_key": {
    "...": "WebAuthn authentication options JSON"
  }
}
```

### 4. `POST /api/auth/passkey/login/verify`
Purpose: verify passkey assertion and issue authenticated session cookie.

Request body:
```json
{
  "challenge_id": 456,
  "credential": {
    "...": "WebAuthn authentication credential response"
  }
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

### 5. `POST /api/auth/recovery/request`
Purpose: fallback recovery/bootstrap path (secondary, non-default).

Request body:
```json
{
  "email": "user@example.com",
  "redirect_path": "/wizard"
}
```

Response `202` (non-enumerating):
```json
{
  "message": "If the email is valid, you will receive a recovery link."
}
```

### 6. `POST /api/auth/recovery/verify`
Purpose: verify fallback recovery token, issue session cookie.

Request body:
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
  },
  "requires_passkey_enrollment": false
}
```

### 7. `GET /api/auth/me`
Purpose: return current authenticated user from session cookie.

Response `200`:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

Response `401`: unauthenticated/expired session.

### 8. `POST /api/auth/logout`
Purpose: revoke active session and clear auth cookie.

Response `204` with cleared cookie.

## 2. Security Semantics

1. Passkey challenge and recovery token state are server-controlled and one-time-use.
2. Challenge and recovery token values are stored as SHA-256 hashes at rest.
3. Passkey challenge verification enforces expiry + replay protection.
4. Recovery verify enforces expiry + replay protection.
5. Session cookie remains `HttpOnly`, `Secure` in production, and environment-specific `SameSite`.
6. Anonymous recommendation flow and unlock endpoints remain available without pre-auth.

## 3. Persistence

Primary auth tables used by backend:
1. `auth_passkey_challenges`
2. `auth_passkeys`
3. `auth_recovery_tokens`
4. `auth_sessions`

Legacy table `auth_magic_links` remains for compatibility but is no longer the primary Phase 2 sign-in path.
