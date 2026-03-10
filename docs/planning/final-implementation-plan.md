# TrustMeBroAI Final Implementation Plan

## 1. Product Overview

### Problem the app solves
Choosing an AI tool is slow and mentally expensive. Most products force users to compare too many options, fields, and scores.

TrustMeBroAI removes that burden by giving one confident recommendation for a specific task.

### Target users
- Business professionals
- Consultants
- Students
- Developers
- Founders

### Core value proposition
- One clear answer, not a research workflow
- Fast decision in under 60 seconds
- Minimal cognitive load (no comparison UX)
- Free product with email as the core value exchange

Business constraint: email capture is a primary product objective, not a side feature.

---

## 2. Final UX Flow

### Complete step-by-step user journey
1. User lands on the website.
2. User starts wizard immediately (no login, no account).
3. User selects profile, task, and one top priority.
4. Backend computes recommendation and returns result payload.
5. Result screen loads in **gated mode**:
- Primary recommendation card is locked/blurred.
- User sees two secondary options (name + one-word context only).
6. User enters email + explicit consent checkbox to unlock.
7. System creates/updates user record and links the recommendation session.
8. Primary recommendation unlocks and displays:
- Tool name + logo
- One-sentence reason
- `Try it ->` button to tool website

### Simplified workflow decisions
- No auth gate before wizard.
- Email gate is applied to the primary recommendation only.
- Result screen is not a comparison interface.
- Maximum visible tools: 3 total (1 primary + 2 secondary).

### Key UI screens
- Landing page
- Wizard flow (3 steps)
- Result screen (locked state)
- Result screen (unlocked state)
- Lightweight login screen for returning users (Phase 2, not required for MVP)

---

## 3. System Architecture

### Frontend architecture
- React SPA with state-driven flow:
- `Landing`
- `Wizard`
- `ResultLocked`
- `EmailUnlock`
- `ResultUnlocked`
- No comparison tables or score visualizations in UI.
- UI contract enforces primary-only reveal after unlock.

### Backend architecture
- Node.js + Express, modular boundaries:
- `session-service` for anonymous wizard sessions
- `recommendation-service` for deterministic scoring
- `lead-capture-service` for email unlock, consent, and user linking
- `result-service` for locked/unlocked response shapes
- API returns internal scoring fields but frontend never displays them.

### Database structure
- PostgreSQL as source of truth.
- Anonymous session and recommendation data created before email capture.
- User record created on unlock event.
- Recommendation session is linked to user after unlock.

### External services
- Coolify deployment
- Docker Compose runtime
- Optional email delivery provider (newsletter/update sends)
- GitHub Actions for CI and later data-update automation

---

## 4. Technology Stack

### Frameworks
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL 16

### Infrastructure
- Dockerized services: frontend, backend, db
- Environment-based configuration
- Scheduled DB backups from MVP launch

### Deployment model (Docker / Coolify)
- Local: `docker-compose.yml`
- Production: `docker-compose.prod.yml` or split Coolify services
- Deployment requirements:
- HTTPS in production
- Strict CORS allowlist
- Rate limits on session and email unlock endpoints

---

## 5. Database Design

### Main entities
- `tools`
- `profiles`
- `tasks`
- `priorities`
- `recommendation_sessions`
- `recommendations`
- `users`
- `recommendation_feedback`

### Relationships
- `recommendation_sessions.profile_id -> profiles.id`
- `recommendation_sessions.task_id -> tasks.id`
- `recommendations.session_id -> recommendation_sessions.id`
- `recommendations.primary_tool_id -> tools.id`
- `users.id -> recommendation_sessions.user_id` (nullable before unlock, required after unlock)
- `recommendation_feedback.recommendation_id -> recommendations.id`

### Core tables

#### `users`
- `id` BIGSERIAL PK
- `email` VARCHAR(255) UNIQUE (case-insensitive uniqueness)
- `email_consent` BOOLEAN NOT NULL
- `consent_timestamp` TIMESTAMP NOT NULL
- `signup_source` VARCHAR(100) NULL
- `plan` VARCHAR(30) DEFAULT `free`
- `subscription_status` VARCHAR(30) DEFAULT `inactive`
- `created_at`, `updated_at`

#### `recommendation_sessions`
- `id` BIGSERIAL PK
- `user_id` BIGINT NULL FK
- `profile_id` INT NOT NULL FK
- `task_id` INT NOT NULL FK
- `selected_priority` VARCHAR(120) NOT NULL
- `wizard_duration_seconds` INT NULL
- `created_at`, `updated_at`

#### `recommendations`
- `id` BIGSERIAL PK
- `session_id` BIGINT NOT NULL FK
- `primary_tool_id` INT NOT NULL FK
- `alternative_tool_ids` JSONB NOT NULL
- `primary_reason` TEXT NOT NULL
- `is_primary_locked` BOOLEAN NOT NULL DEFAULT TRUE
- `unlocked_at` TIMESTAMP NULL
- `created_at`

#### `tools` (internal scoring fields)
- `tool_name`, `tool_slug`, `logo_url`, `best_for`, `website`, `category`
- `pricing`, `ease_of_use`, `speed`, `quality`
- `target_users`, `tags`
- `referral_url` NULL (future)

#### `recommendation_feedback`
- `id` BIGSERIAL PK
- `recommendation_id` BIGINT NOT NULL FK
- `signal` SMALLINT CHECK (`-1|1`)
- `created_at`

---

## 6. Core Features

### Feature list
1. 3-step wizard without pre-auth friction
2. Deterministic recommendation engine (internal weighted scoring)
3. Locked primary recommendation with email unlock
4. Secondary options shown as name + one-word context only
5. Consent-aware email capture and user creation
6. One-click `Try it ->` primary CTA
7. Feedback capture for quality iteration

### Functional behavior
- Wizard submission creates `recommendation_session` and recommendation record.
- API response for locked state includes:
- `session_id`
- `primary_tool` metadata with `locked=true` flag
- `alternative_tools` limited to 2, each with `tool_name` + `context_word`
- Email unlock endpoint validates email + consent and then:
- upserts user
- links session to user
- marks recommendation unlocked
- returns full primary card payload

### API interactions
- `GET /api/profiles`
- `GET /api/tasks`
- `GET /api/priorities`
- `POST /api/recommendation/session`
- `POST /api/recommendation/compute`
- `POST /api/recommendation/unlock`
- `POST /api/recommendation/:id/feedback`

Response contract rules:
- Never expose scoring numbers in UI-facing fields.
- Never return more than 3 tools for result rendering.

---

## 7. Performance Considerations

- Target end-to-end wizard + result generation under 60 seconds user journey; API recommendation compute under 500 ms p95.
- Indexes:
- `users(lower(email))` unique
- `recommendation_sessions(task_id, created_at)`
- `recommendation_sessions(user_id)`
- `recommendations(session_id)`
- `recommendations(is_primary_locked, created_at)`
- Keep scoring deterministic and SQL-local (no external model dependency in MVP).
- Cache lookup tables (`profiles`, `tasks`, `priorities`) with short TTL.

---

## 8. Security & Data Handling

### Authentication and access model
- MVP access model: anonymous wizard + email unlock gate.
- Returning-user login is deferred to Phase 2.
- Until Phase 2, no protected app area requiring password auth.

### Data protection
- Validate all inputs (`email`, consent, session IDs, priority values).
- Parameterized SQL only.
- Store explicit consent fields per user.
- Capture `signup_source` for attribution.
- GDPR-aware retention and deletion support for email records.

### Rate limits
- `POST /api/recommendation/session`: 30 req/min/IP
- `POST /api/recommendation/compute`: 20 req/min/IP
- `POST /api/recommendation/unlock`: 10 req/min/IP
- `POST /api/recommendation/:id/feedback`: 30 req/min/IP

---

## 9. Development Phases

### Phase 1: MVP (conversion-first)
Scope:
- Implement wizard-first flow (no pre-auth).
- Implement locked primary recommendation UX.
- Implement email unlock endpoint and consent capture.
- Persist user records on unlock with source attribution.
- Enforce result screen contract (no comparison UI, no score display).
- Seed 20-30 curated tools.

Exit criteria:
- Wizard completion in under 60 seconds median.
- Email unlock conversion measurable and stable.
- `Try it ->` click-through tracked after unlock.

### Phase 2: Feature expansion
Scope:
- Add returning-user login (magic link or passwordless email flow preferred).
- Add saved recommendation history by user.
- Add richer analytics dashboards (funnel: start -> complete -> unlock -> try-it).
- Implement safe dataset update automation (post-MVP).

Exit criteria:
- Returning users can access past recommendations.
- Channel-level conversion by `signup_source` is visible.

### Phase 3: Optimization
Scope:
- Subscription tiers and entitlements
- Newsletter personalization
- Optional advanced retrieval only if deterministic scoring is insufficient

Exit criteria:
- Monetization-ready account model active
- Recommendation quality improvements validated by feedback and CTR

---

## 10. Open Questions / Future Enhancements

- Should unlock require double opt-in email confirmation or unlock immediately with consent checkbox?
- Should returning-user authentication be magic-link only or email+password?
- What is the minimum acceptable unlock conversion rate for MVP go/no-go?
- Should `Try it ->` clicks open direct website or referral URL when available?
- At what catalog size should semantic retrieval be reconsidered?
