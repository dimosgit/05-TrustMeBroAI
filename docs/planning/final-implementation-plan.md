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
- Verified email audience for product updates and newsletter growth

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
6. User enters email + explicit consent checkbox and requests unlock.
7. System creates/updates the user record in pending state and sends a verification link.
8. User clicks the verification link to confirm inbox ownership.
9. System links the recommendation session to the verified user and unlocks the result.
10. Primary recommendation unlocks and displays:
- Tool name + logo
- One-sentence reason
- `Try it ->` button to tool website

### Simplified workflow decisions
- No auth gate before wizard.
- Email verification gate is applied to the primary recommendation only.
- Result screen is not a comparison interface.
- Maximum visible tools: 3 total (1 primary + 2 secondary).

### Key UI screens
- Landing page
- Wizard flow (3 steps)
- Result screen (locked state)
- Result screen (unlocked state)
- Email verification confirmation state
- Passkey registration screen for returning users (Phase 2)
- Passkey sign-in screen for returning users (Phase 2)
- Fallback email recovery / account bootstrap screen (Phase 2)

---

## 3. System Architecture

### Frontend architecture
- React SPA with state-driven flow:
- `Landing`
- `Wizard`
- `ResultLocked`
- `EmailUnlock`
- `ResultUnlocked`
- `RegisterPasskey` (Phase 2)
- `LoginPasskey` (Phase 2)
- `AccountRecovery` (Phase 2)
- No comparison tables or score visualizations in UI.
- UI contract enforces primary-only reveal after unlock.

### Backend architecture
- Node.js + Express, modular boundaries:
- `session-service` for anonymous wizard sessions
- `recommendation-service` for deterministic scoring
- `lead-capture-service` for email verification, consent, user linking, and unlock completion
- `result-service` for locked/unlocked response shapes
- `auth-service` for passkey registration, sign-in, recovery, and account session lifecycle (Phase 2)
- API returns internal scoring fields but frontend never displays them.

### Database structure
- PostgreSQL as source of truth.
- Anonymous session and recommendation data created before email capture.
- User record is created or updated when unlock is requested.
- Recommendation session is linked to user only after email ownership is verified.

### External services
- Coolify deployment
- Docker Compose runtime
- Email delivery / newsletter provider for verification, product updates, and newsletter sends
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
- `email_verification_tokens`
- `auth_passkeys` (Phase 2)
- `auth_sessions` (Phase 2)
- `auth_recovery_tokens` (Phase 2)

### Relationships
- `recommendation_sessions.profile_id -> profiles.id`
- `recommendation_sessions.task_id -> tasks.id`
- `recommendations.session_id -> recommendation_sessions.id`
- `recommendations.primary_tool_id -> tools.id`
- `users.id -> recommendation_sessions.user_id` (nullable before unlock, required after unlock)
- `recommendation_feedback.recommendation_id -> recommendations.id`
- `email_verification_tokens.user_id -> users.id`
- `auth_passkeys.user_id -> users.id` (Phase 2)
- `auth_sessions.user_id -> users.id` (Phase 2)
- `auth_recovery_tokens.user_id -> users.id` (Phase 2)

### Core tables

#### `users`
- `id` BIGSERIAL PK
- `email` VARCHAR(255) UNIQUE (case-insensitive uniqueness)
- `email_consent` BOOLEAN NOT NULL
- `consent_timestamp` TIMESTAMP NOT NULL
- `email_verified_at` TIMESTAMP NULL
- `signup_source` VARCHAR(100) NULL
- `marketing_subscription_status` VARCHAR(30) DEFAULT `pending_verification`
- `marketing_subscribed_at` TIMESTAMP NULL
- `marketing_unsubscribed_at` TIMESTAMP NULL
- `marketing_opt_in_source` VARCHAR(100) NULL
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
- `unlock_requested_at` TIMESTAMP NULL
- `unlocked_at` TIMESTAMP NULL
- `created_at`

#### `tools` (internal scoring fields)
- `tool_name`, `tool_slug`, `logo_url`, `best_for`, `website`, `category`
- `pricing` (display/source label), `pricing_tier` (`free|freemium|paid_low|paid_mid|paid_high`)
- `ease_of_use`, `speed`, `quality`
- `target_users`, `tags`
- `context_word` VARCHAR(40) NULL (for alternative preview only)
- `record_status` (`active|inactive|deprecated`) default `active`
- `referral_url` NULL (future)

#### `recommendation_feedback`
- `id` BIGSERIAL PK
- `recommendation_id` BIGINT NOT NULL FK
- `signal` SMALLINT CHECK (`-1|1`)
- `created_at`

#### `email_verification_tokens`
- `id` BIGSERIAL PK
- `user_id` BIGINT NOT NULL FK
- `token_hash` TEXT UNIQUE NOT NULL
- `purpose` VARCHAR(40) NOT NULL DEFAULT `recommendation_unlock`
- `expires_at` TIMESTAMP NOT NULL
- `used_at` TIMESTAMP NULL
- `created_at`

#### Phase 2 auth entities

#### `auth_passkeys`
- `id` BIGSERIAL PK
- `user_id` BIGINT NOT NULL FK
- `credential_id` TEXT UNIQUE NOT NULL
- `public_key` TEXT NOT NULL
- `counter` BIGINT NOT NULL DEFAULT `0`
- `device_name` VARCHAR(120) NULL
- `created_at`, `updated_at`, `last_used_at`

#### `auth_sessions`
- `id` BIGSERIAL PK
- `user_id` BIGINT NOT NULL FK
- `session_token_hash` TEXT UNIQUE NOT NULL
- `expires_at` TIMESTAMP NOT NULL
- `created_at`, `updated_at`, `revoked_at`

#### `auth_recovery_tokens`
- `id` BIGSERIAL PK
- `user_id` BIGINT NOT NULL FK
- `token_hash` TEXT UNIQUE NOT NULL
- `purpose` VARCHAR(40) NOT NULL
- `expires_at` TIMESTAMP NOT NULL
- `used_at` TIMESTAMP NULL
- `created_at`

---

## 6. Core Features

### Feature list
1. 3-step wizard without pre-auth friction
2. Deterministic recommendation engine (internal weighted scoring)
3. Locked primary recommendation with email unlock
4. Verification-link-based email ownership confirmation before primary unlock
5. Secondary options shown as name + one-word context only
6. Consent-aware email capture and verified user creation
7. Verified-email newsletter / product-update audience capture
8. One-click `Try it ->` primary CTA
9. Feedback capture for quality iteration

### Functional behavior
- Wizard submission creates `recommendation_session` and recommendation record.
- API response for locked state includes:
- `session_id`
- `primary_tool` metadata with `locked=true` flag
- `alternative_tools` limited to 2, each with `tool_name` + `context_word`
- Email unlock request endpoint validates email + consent and then:
- upserts user in pending verification state
- creates a time-limited verification token
- sends a verification link
- keeps the primary recommendation locked until verification completes
- Email unlock verify endpoint validates token and then:
- marks the user email verified
- marks the user marketing subscription active when consent is present and no unsubscribe exists
- links session to user
- marks recommendation unlocked
- returns full primary card payload
- Follow-the-build subscribe endpoint validates email + consent and then:
- upserts the user in pending verification state or refreshes the existing lead record
- creates a time-limited verification token
- sends a verification link
- marks the newsletter subscription active only after verification completes

### API interactions
- `GET /api/profiles`
- `GET /api/tasks`
- `GET /api/priorities`
- `POST /api/recommendation/session`
- `POST /api/recommendation/compute`
- `POST /api/recommendation/unlock/request`
- `POST /api/recommendation/unlock/verify`
- `POST /api/follow-build/subscribe`
- `POST /api/newsletter/unsubscribe`
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
- Returning-user account access is deferred to Phase 2.
- Phase 2 auth model: passkey-first sign-up and sign-in, with fallback email recovery/bootstrap.
- Email remains the account identifier; no separate username is introduced.
- Until Phase 2, no protected app area requiring account auth.

### Data protection
- Validate all inputs (`email`, consent, session IDs, priority values).
- Parameterized SQL only.
- Store explicit consent fields per user.
- Treat unverified emails as incomplete leads; only verified emails are eligible for primary recommendation unlock and trusted account recovery.
- Only verified and actively subscribed emails are eligible for newsletter or product-update sends.
- Unsubscribe and suppression state must be respected across all outbound marketing sends.
- Capture `signup_source` for attribution.
- GDPR-aware retention and deletion support for email records.

### Rate limits
- `POST /api/recommendation/session`: 30 req/min/IP
- `POST /api/recommendation/compute`: 20 req/min/IP
- `POST /api/recommendation/unlock/request`: 10 req/min/IP
- `POST /api/recommendation/unlock/verify`: 20 req/min/IP
- `POST /api/recommendation/:id/feedback`: 30 req/min/IP

---

## 9. Development Phases

### Phase 1: MVP (conversion-first)
Scope:
- Implement wizard-first flow (no pre-auth).
- Implement locked primary recommendation UX.
- Implement verification-link-based email unlock and consent capture.
- Persist user records with verification status and source attribution.
- Enforce result screen contract (no comparison UI, no score display).
- Seed 20-30 curated tools.

Exit criteria:
- Wizard completion in under 60 seconds median.
- Verified email unlock conversion measurable and stable.
- `Try it ->` click-through tracked after unlock.

### Phase 2: Feature expansion
Scope:
- Add returning-user account access with passkey-first auth.
- Add fallback email recovery/bootstrap for users who cannot use their passkey yet.
- Add saved recommendation history by user.
- Add richer analytics dashboards (funnel: start -> complete -> unlock -> register -> sign-in -> try-it).
- Add verified newsletter subscription foundation, unsubscribe handling, and provider sync/export.
- Extract frontend copy into translation resources and prepare the app for internationalization.
- Implement safe dataset update automation (post-MVP).

Exit criteria:
- Returning users can register and sign in with passkeys.
- Fallback email recovery/bootstrap works reliably.
- Returning users can access past recommendations.
- Channel-level conversion by `signup_source` is visible.
- Verified newsletter audience can be exported or synced safely to the sending provider.
- English copy is externalized and ready for future locales.

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

### Answered

**Should unlock require double opt-in email confirmation or unlock immediately with consent checkbox?**
Require inbox ownership verification through a verification link before unlocking the primary recommendation. Syntax and domain checks alone are not sufficient because they still allow random or mistyped emails. This adds friction, but verified emails are a hard product requirement and take precedence over raw unlock-volume optimization.

**Should returning-user authentication be passkey-first, magic-link only, or email+password?**
Passkey-first for Phase 2, with email fallback only for recovery/bootstrap. No passwords and no separate username. This gives the product a more credible and modern account model than magic-link-only auth, while still avoiding password reset complexity. Email remains the account identifier, and fallback email recovery exists so users are not blocked if passkey setup is incomplete or they change devices.

**Should `Try it ->` clicks open direct website or referral URL when available?**
Open `referral_url` when populated, fall back to `website` when not. This enables future monetization without any frontend change. The `referral_url` field should be added to the `tools` table now, even if empty for all MVP tools.

**What is the minimum acceptable unlock conversion rate for MVP go/no-go?**
Target: 20% of wizard completions result in a verified email unlock. Below 10% after 200 completions indicates the result screen or the verification step needs reworking before further promotion. Track this from day one.

**Should the landing page include a separate "follow the build" email capture independent of the wizard flow?**
Yes. Include a low-friction "follow the build" capture on landing, separate from the recommendation unlock gate. Store these signups with distinct `signup_source` / campaign tags so this channel does not get mixed with unlock-conversion metrics.

**How should verified emails be used for newsletter and product-update sends?**
Use the same verified email record as the source of truth for product updates and newsletter sends, but keep marketing subscription state separate from auth/recovery logic. Only verified emails with active subscription status may receive newsletter sends, and unsubscribe/suppression state must be enforced globally.

---

### Scoring Formula Spec

The recommendation engine uses deterministic weighted scoring. No external model dependency. All computation is SQL-local.

**Base score per tool:**
```
score = (quality × w_quality) + (speed × w_speed) + (ease_of_use × w_ease) + pricing_fit × w_price
```

All rating fields (`quality`, `speed`, `ease_of_use`) are integers 1–5.

Profile selection is not part of the base numeric formula in MVP. It is used for attribution/analytics and as a late tiebreak signal only.

`pricing_fit` is derived from `pricing_tier` only (not free-text `pricing`):
- `free` -> 5
- `freemium` -> 4
- `paid_low` -> 3
- `paid_mid` -> 2
- `paid_high` -> 1

If `pricing_tier` is missing or invalid, default to `paid_mid` (2) and flag the tool for curation.

**Weight profiles by selected priority:**

| Selected Priority   | w_quality | w_speed | w_ease | w_price |
|---------------------|-----------|---------|--------|---------|
| Best quality        | 0.5       | 0.2     | 0.2    | 0.1     |
| Fastest results     | 0.2       | 0.5     | 0.2    | 0.1     |
| Easiest to use      | 0.2       | 0.2     | 0.5    | 0.1     |
| Lowest price        | 0.1       | 0.2     | 0.2    | 0.5     |

**Tiebreaker (priority-aware):**
- If selected priority is `Best quality`, prefer higher `quality`.
- If selected priority is `Fastest results`, prefer higher `speed`.
- If selected priority is `Easiest to use`, prefer higher `ease_of_use`.
- If selected priority is `Lowest price`, prefer higher `pricing_fit`.
- If still tied, prefer tool where `target_users` contains selected profile.
- If still tied, prefer alphabetical by `tool_name`.

**Filtering before scoring:**
- Only score tools where `category` matches the selected `task` category.
- Only score tools where `record_status = 'active'`.
- If fewer than 3 tools exist in the selected category, expand categories in this strict order:
- `Document/PDF` -> `Research` -> `Content Creation`
- `Research` -> `Document/PDF` -> `Content Creation`
- `Content Creation` -> `Document/PDF` -> `Research`
- `Coding` -> `Automation` -> `Research`
- `Automation` -> `Coding` -> `Research`
- If still fewer than 3 candidates, include highest-scoring tools from all remaining active categories.

**Output:**
- Rank all matching tools by score descending.
- `primary_tool` = rank 1.
- `alternative_tools` = ranks 2 and 3.

---

### `primary_reason` Generation Spec

The `primary_reason` is a one-sentence plain-language explanation displayed on the result screen after unlock. It is generated at compute time using a template, not AI generation.

**Template:**
```
"{tool_name} is the best fit for {task_label} {priority_context}."
```

**`priority_context` values by selected priority:**

| Selected Priority | priority_context                        |
|-------------------|-----------------------------------------|
| Best quality      | "when quality is what matters most"     |
| Fastest results   | "when you need results fast"            |
| Easiest to use    | "if you want the simplest experience"   |
| Lowest price      | "without spending money"                |

**Example outputs:**
- "ChatGPT is the best fit for analyzing PDFs when quality is what matters most."
- "Zapier is the best fit for automation without spending money."
- "Cursor is the best fit for coding if you want the simplest experience."

The `best_for` field on the tool record is used as supplementary context in the UI (shown as a sub-label under the tool name after unlock), not as the reason sentence itself.

**`context_word` for alternative tools:**
Each alternative tool shown before the gate displays a single short context phrase. This is sourced directly from a `context_word` field on the `tools` table (e.g., "free tier", "Microsoft ecosystem", "open source"). If empty, show nothing — do not fabricate context.

---

### Still Open

- At what catalog size should semantic retrieval be reconsidered? (suggested trigger: 200+ active tools or when structured scoring produces ties on more than 30% of queries)
