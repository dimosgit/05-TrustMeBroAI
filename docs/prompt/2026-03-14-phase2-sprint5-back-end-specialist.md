## 1. Feature Title
`Phase 2 Sprint 5 Back-End Specialist: Verified Email Gate and Newsletter Foundation`

## 2. Objective
Implement the backend changes required to enforce verified-email-only recommendation unlock and to establish the first newsletter-safe email lifecycle foundation. The goal is to prevent random or mistyped emails from unlocking results while making verified subscribed emails usable for newsletter and product-update sends.

## 3. Context
- Product area: `Recommendation unlock, email verification, and newsletter lifecycle`
- Current behavior: `The plan now requires inbox ownership verification before primary recommendation unlock. The repo already has passkey auth and email recovery infrastructure, but the recommendation unlock flow still needs explicit verification-link request/verify behavior and the newsletter subscription model needs to be formalized on top of verified emails.`
- Problem to solve: `We need one backend model that treats email ownership as required for unlock and uses verified subscribed emails as the source of truth for newsletter sends without mixing marketing rules with auth/recovery rules.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-newsletter-email-strategy.md`
5. Existing auth/recovery code under `backend/src/services/authService.js`
6. Existing lead capture and follow-build code under `backend/src/services/leadCaptureService.js` and `backend/src/services/followBuildService.js`

## 4. Scope
- In scope:
  1. Implement `POST /api/recommendation/unlock/request` and `POST /api/recommendation/unlock/verify` or align the current backend to that contract.
  2. Add verification-token lifecycle and verified-email state for recommendation unlock.
  3. Add newsletter subscription state and unsubscribe handling for verified emails.
  4. Add provider sync/export foundation for verified subscribed emails, or the safest narrow backend path that prepares it.
  5. Add or update backend planning notes under `docs/planning/` for any contract or operational details introduced.
- Out of scope:
  1. Editing `docs/planning/final-implementation-plan.md`.
  2. Password-based auth.
  3. Broad marketing campaign automation.
  4. Frontend UI work beyond backend-owned API contract documentation.

## 5. Requirements
1. Primary recommendation unlock must remain locked until the user verifies inbox ownership through a verification link.
2. Recommendation unlock request must create or update the user in pending state, issue a time-limited verification token, and send a verification link.
3. Recommendation unlock verify must mark the email verified, link the session to the verified user, and only then unlock the result.
4. Newsletter and product-update eligibility must require `verified + subscribed + not unsubscribed + not suppressed` state.
5. Unsubscribe behavior must be explicit and must not affect account auth/recovery ability.
6. Provider sync/export logic must exclude unverified or unsubscribed users.
7. Existing passkey registration, sign-in, and recovery flows must not regress.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Reuse or align with the existing token and mail-delivery infrastructure where it is safe to do so.
3. Keep newsletter subscription state separate from auth session/passkey state.
4. Preserve transactional safety around verification, user linking, and unlock state transitions.
5. Avoid leaking unlocked recommendation payloads before verification succeeds.

## 7. Implementation Notes
1. Prefer a single verification-token mechanism with purpose separation over introducing multiple unrelated token systems.
2. Keep verification purpose explicit, for example `recommendation_unlock` and `follow_build_subscribe`.
3. If provider sync/export is too large for this slice, implement a narrow deterministic export/query path over verified subscribed users and document the next step clearly.
4. Update or add backend planning docs under `docs/planning/` for:
   - unlock request/verify contract
   - newsletter subscription state model
   - unsubscribe behavior
   - provider sync/export assumptions
5. Preserve source attribution such as `signup_source` and `marketing_opt_in_source`.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - unverified email cannot unlock recommendation
   - verified email unlock succeeds and links the correct session/user
   - invalid, expired, and reused verification tokens fail safely
   - unsubscribe blocks newsletter eligibility without breaking auth/recovery
   - provider sync/export excludes unverified and unsubscribed users

## 9. Acceptance Criteria
1. Backend enforces verified-email-only unlock.
2. Unlock verification flow is auditable, token-based, and test-backed.
3. Newsletter eligibility is derived from explicit verified/subscribed state.
4. Unsubscribe behavior is implemented and isolated from auth.
5. Existing auth/recovery behavior remains stable.

## 10. Deliverables
1. Backend code implementing verified-email unlock and newsletter lifecycle foundation.
2. Test changes proving correctness and non-regression.
3. Backend planning note(s) under `docs/planning/` documenting the new contract and lifecycle rules.
4. Short implementation summary including exact test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Existing auth/recovery token infrastructure can be reused or adapted safely for recommendation unlock verification.
  2. Newsletter provider sync can start as an internal export/sync foundation instead of a full automation system.
- Open questions:
  1. Should unsubscribe be exposed only through tokenized email links in this slice, or also via an authenticated endpoint?
