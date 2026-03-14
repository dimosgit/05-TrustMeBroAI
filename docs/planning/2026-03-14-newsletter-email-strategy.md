# TrustMeBroAI Newsletter Email Strategy

Source of truth remains [final-implementation-plan.md](/Users/dimouzunov/00%20Coding/05%20TrustMeBroAI/05-TrustMeBroAI/docs/planning/final-implementation-plan.md). This note explains how to use captured emails for newsletter and product updates without mixing marketing concerns with auth/recovery concerns.

## Goal

Use verified emails as a high-quality newsletter and product-update audience while keeping:
- recommendation unlock secure
- consent auditable
- unsubscribe handling reliable
- auth/recovery flows separate from marketing sends

## Recommended Model

Use one canonical user email record and separate its states:
- identity state: does this email belong to the user?
- subscription state: should this email receive newsletter/product updates?

Recommended rules:
1. No newsletter sends to unverified emails.
2. No primary recommendation unlock for unverified emails.
3. No recovery trust based on unverified emails.
4. Newsletter eligibility requires:
   - explicit consent
   - successful email verification
   - active subscription status
   - not unsubscribed
   - not suppressed/bounced

## Recommended Data Model

Keep `users` as the source of truth and use these fields:
- `email`
- `email_verified_at`
- `email_consent`
- `consent_timestamp`
- `signup_source`
- `marketing_subscription_status`
- `marketing_subscribed_at`
- `marketing_unsubscribed_at`
- `marketing_opt_in_source`

Recommended `marketing_subscription_status` values:
- `pending_verification`
- `subscribed`
- `unsubscribed`
- `suppressed`

Use verification tokens for both:
- recommendation unlock verification
- follow-the-build / newsletter verification

The verification token purpose should distinguish flows, for example:
- `recommendation_unlock`
- `follow_build_subscribe`

## Functional Flows

### 1. Recommendation Unlock Flow
1. User completes wizard.
2. User enters email and consent.
3. System creates or updates the email record in pending state.
4. System sends a verification link.
5. User clicks the verification link.
6. System marks the email verified.
7. System marks marketing subscription active if consent is present.
8. System unlocks the primary recommendation.

### 2. Follow-The-Build Newsletter Flow
1. User enters email in the follow-the-build form.
2. System creates or updates the email record in pending state.
3. System sends a verification link.
4. User clicks the verification link.
5. System marks the email verified.
6. System marks newsletter subscription active.

### 3. Unsubscribe Flow
1. Every newsletter/update email includes an unsubscribe link.
2. User clicks unsubscribe.
3. System sets `marketing_subscription_status = unsubscribed`.
4. Future marketing sends are blocked immediately.

Auth/recovery must remain separate:
- unsubscribing from newsletter must not break account access
- recovery emails are transactional, not marketing

## Minimum Functional Requirements Missing Today

These requirements should be implemented before newsletter sends are considered production-ready:

1. Verification-aware newsletter subscription model
   - newsletter sends must filter to verified + subscribed emails only

2. Explicit unsubscribe endpoint
   - `POST /api/newsletter/unsubscribe`
   - or tokenized GET/POST unsubscribe flow backed by signed tokens

3. Provider sync/export path
   - either push subscribed verified users to the email provider
   - or export a clean subscribed list from the app database

4. Suppression handling
   - bounced or provider-suppressed emails must be marked `suppressed`

5. Subscription source tracking
   - differentiate:
     - `recommendation_unlock`
     - `follow_the_build`
     - future campaigns

6. Delivery segmentation rules
   - newsletter/product-update sends should support segmentation by:
     - verified unlock users
     - follow-the-build only subscribers
     - source/campaign tags

7. QA release gate
   - prove that:
     - unverified emails never receive newsletter sends
     - unsubscribed emails never receive newsletter sends
     - verification status changes propagate to provider sync/export

## Suggested Implementation Order

### Phase 2 foundation
1. Add verification-aware subscription fields and rules.
2. Add unsubscribe flow.
3. Add provider sync/export foundation.
4. Add QA coverage and release evidence.

### Later
1. Newsletter automation cadence.
2. Audience segmentation.
3. Personalization.

## Operational Suggestions

1. Start with a single provider integration and keep the app database as source of truth.
2. Sync only `verified + subscribed` users.
3. Keep newsletter content and transactional emails logically separated.
4. Add provider webhooks later for bounce/suppression feedback if needed.
5. Track these metrics from day one:
   - verification rate
   - verified unlock rate
   - follow-the-build verification rate
   - unsubscribe rate
   - bounce/suppression rate

## Product Recommendation

Use the same verified email pool for:
- recommendation unlock
- follow-the-build updates
- newsletter/product updates

But do not treat that as “one giant consent bucket.” The implementation should preserve:
- verification state
- subscription state
- source attribution
- unsubscribe/suppression enforcement

That is the cleanest way to get newsletter value from captured emails without making auth, unlock, consent, and marketing ambiguous.
