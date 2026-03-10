# TrustMeBroAI Final Implementation Plan

## 1. Product Overview

### Problem the app solves
People spend too much time comparing AI tools across fragmented and outdated sources. TrustMeBroAI gives a fast, explainable recommendation for the user’s exact task and priorities.

### Target users
- Business professionals
- Consultants
- Students
- Developers
- Founders and creators

### Core value proposition
- Fast decision support with clear recommendations
- Transparent tradeoffs (not black-box output)
- Curated and updatable tool intelligence
- Account-based experience from day one (saved data, personalization, growth channel)

Non-negotiable requirement: **the recommendation tool is accessible only to authenticated users**.

---

## 2. Final UX Flow

### Complete step-by-step user journey
1. User lands on public landing page.
2. User can choose `Register` or `Login`.
3. User cannot access wizard, recommendation, or internal app screens before authentication.
4. New user registers with email + password.
5. Registration screen shows friendly consent copy:
   - "This tool is free. In exchange, we may occasionally send product updates. No spam. Just useful AI stuff."
6. After successful login/registration, user enters the app wizard.
7. User selects profile, task, and priorities.
8. System generates recommendation result with primary tool, alternatives, and explanation.
9. User can give quick feedback (`thumbs_up` / `thumbs_down`).
10. Authenticated user session is tracked for future saved history and analytics.

### Simplified workflow decisions
- Hard auth gate before any tool functionality.
- Public pages limited to landing + login + register.
- No anonymous recommendation flow.
- Profile/task/priority flow remains simple and deterministic for MVP.

### Key UI screens
- Public Landing
- Register
- Login
- Protected Wizard
- Protected Recommendation Result

---

## 3. System Architecture

### Frontend architecture
- React (Vite) SPA with explicit route-state boundaries:
- Public: `Landing`, `Login`, `Register`
- Protected: `Wizard`, `Result`
- `AuthContext`/session bootstrap checks authenticated user on app load.
- `ProtectedRoute` (or guarded view state) blocks protected screens when unauthenticated.
- All API calls use credentialed requests for session cookie transport.

### Backend architecture
- Node.js + Express with layered modules:
- `auth` module (registration, login, logout, session parsing, auth middleware)
- `routes` (HTTP contracts)
- `services` (recommendation + session logic)
- `repositories` (PostgreSQL queries)
- Global auth context middleware parses session and attaches `req.user`.
- Guard middleware (`requireAuth`) protects all application endpoints except public auth/health endpoints.

### Database structure
- PostgreSQL as source of truth.
- `users` and `auth_sessions` are foundational tables.
- Business tables (`user_sessions`, `recommendations`) are user-owned and reference authenticated users.
- Tool and recommendation tables remain the core recommendation data model.

### External services
- Coolify for deployment orchestration.
- Docker Compose for local and production-like environments.
- GitHub Actions for CI/CD and later data-release automation.
- Future optional OAuth providers (Google/GitHub) via pluggable auth provider design.

---

## 4. Technology Stack

### Frameworks
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL 16
- Auth/security: password hashing (scrypt/bcrypt class), secure cookie sessions, request validation, rate limiting

### Infrastructure
- Multi-service Docker setup (`frontend`, `backend`, `db`)
- Env-based configuration for CORS, DB URL, auth settings
- Scheduled backups for PostgreSQL from first public release

### Deployment model (Docker / Coolify)
- Local: `docker-compose.yml`
- Production: `docker-compose.prod.yml` or split Coolify services
- Deployment baseline:
- Enforce strong production DB credentials
- HTTPS termination in front of app
- Secure cookie behavior in production (`HttpOnly`, `Secure`, `SameSite`)

---

## 5. Database Design

### Main entities
- `users`
- `auth_sessions`
- `profiles`
- `tasks`
- `priorities`
- `tools`
- `user_sessions`
- `recommendations`
- `recommendation_feedback`

### Relationships
- `auth_sessions.user_id -> users.id`
- `user_sessions.user_id -> users.id`
- `user_sessions.profile_id -> profiles.id`
- `user_sessions.task_id -> tasks.id`
- `recommendations.user_session_id -> user_sessions.id`
- `recommendations.primary_tool_id -> tools.id`
- `recommendation_feedback.recommendation_id -> recommendations.id`

### Core tables

#### `users`
- `id` BIGSERIAL PK
- `email` VARCHAR(255) UNIQUE (case-insensitive uniqueness)
- `password_hash` TEXT
- `auth_provider` (default `local`, future OAuth-ready)
- `provider_user_id` (nullable)
- `marketing_consent` BOOLEAN
- `consent_copy` TEXT
- `plan` (`free|pro|team|enterprise`)
- `subscription_status` (`inactive|trial|active|past_due|canceled`)
- `metadata` JSONB
- `is_active` BOOLEAN
- `last_login_at`, `created_at`, `updated_at`

#### `auth_sessions`
- `id` BIGSERIAL PK
- `user_id` FK
- `session_token_hash` CHAR(64) UNIQUE
- `ip_hash` CHAR(64)
- `user_agent` TEXT
- `expires_at`, `created_at`, `last_seen_at`, `revoked_at`

#### `user_sessions`
- `id` BIGSERIAL PK
- `user_id` FK (required)
- `profile_id`, `task_id`
- `budget`, `experience_level`
- `selected_priorities` JSONB
- timestamps

#### `recommendations`
- `id` BIGSERIAL PK
- `user_session_id` FK
- `primary_tool_id` FK
- `alternative_tool_ids` JSONB
- `explanation` TEXT
- `created_at`

#### `recommendation_feedback`
- `id` BIGSERIAL PK
- `recommendation_id` FK
- `signal` SMALLINT (`-1|1`)
- `comment` TEXT nullable
- `created_at`

---

## 6. Core Features

### Feature list
1. Email/password registration
2. Email/password login
3. Persistent secure session management
4. Hard route/API protection for all app features
5. Guided recommendation wizard (authenticated only)
6. Recommendation output with alternatives + explanation
7. Feedback capture linked to recommendation

### Functional behavior
- Register:
- Validate email format and password strength.
- Hash password before storing.
- Persist user record with consent metadata.
- Create authenticated session immediately after registration.

- Login:
- Validate credentials.
- Verify password hash.
- Create session and set secure cookie.

- Access control:
- Unauthenticated requests to protected API return `401`.
- Frontend never renders protected views unless `auth/me` succeeds.

- Recommendation flow:
- Same deterministic scoring path as MVP contract.
- Recommendation belongs to authenticated user via `user_sessions.user_id`.

### API interactions
Public:
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Protected:
- `GET /api/auth/me`
- `GET /api/profiles`
- `GET /api/tasks`
- `GET /api/priorities`
- `GET /api/tools`
- `POST /api/session`
- `POST /api/recommendation`
- `POST /api/recommendations/:id/feedback`

---

## 7. Performance Considerations

- Keep auth/session lookups indexed and lightweight.
- Indexes:
- `users(lower(email))` unique
- `auth_sessions(session_token_hash)` unique
- `auth_sessions(user_id, expires_at)`
- `user_sessions(user_id)`
- `recommendations(user_session_id)`
- Cache non-sensitive lookup tables (`profiles`, `tasks`, `priorities`) for authenticated users.
- Keep recommendation queries deterministic and DB-local for MVP responsiveness.

---

## 8. Security & Data Handling

### Authentication
- Password hashing required (strong adaptive hash strategy).
- Session token stored as hashed value in DB.
- Session token delivered via `HttpOnly` cookie.
- Session expiration + revocation support.

### Data protection
- Strict request validation on auth and protected endpoints.
- Parameterized SQL only.
- CORS allowlist for trusted frontend origins.
- Store only required user PII (email + auth/session metadata).
- Hash IP in session records rather than storing plain IP.

### Rate limits
- `POST /api/auth/register`: 10 req/min/IP
- `POST /api/auth/login`: 10 req/min/IP
- `POST /api/session`: 20 req/min/IP
- `POST /api/recommendation`: 15 req/min/IP
- `POST /api/recommendations/:id/feedback`: 30 req/min/IP

---

## 9. Development Phases

### Phase 1: MVP (authentication-first baseline)
Scope:
- Implement `users` + `auth_sessions` schema.
- Build auth module (register/login/logout/me).
- Add password hashing + secure session cookies.
- Enforce route guards in frontend and backend.
- Keep public access limited to landing/login/register only.
- Ensure recommendation flow works only for authenticated users.

Exit criteria:
- Unauthenticated users cannot access any tool API or screens.
- Register/login/logout flows are stable.
- Recommendation records are tied to authenticated user IDs.

### Phase 2: Feature expansion
Scope:
- Saved recommendations/history per user.
- Usage analytics dashboards.
- Extended account lifecycle controls (email verification/reset).
- Data release pipeline improvements for tool catalog updates.

Exit criteria:
- Users can revisit prior recommendations.
- Product analytics available at user/cohort level.

### Phase 3: Optimization
Scope:
- Subscription tiers and entitlements.
- OAuth providers (Google/GitHub) via provider abstraction.
- Advanced recommendation retrieval upgrades.

Exit criteria:
- Tier-based feature access operational.
- Multiple auth providers supported without auth module rewrite.

---

## 10. Open Questions / Future Enhancements

- Should email verification be required before first recommendation, or only before premium features?
- Password reset flow timing (Phase 1.5 vs Phase 2).
- Session policy tuning (single session vs multi-device sessions).
- Exact consent UX variant for best conversion while staying transparent.
- Subscription/payment provider choice and rollout sequence.
- OAuth provider priority order after local auth stabilizes.
