# TrustMeBroAI Post-Phase-1 Next Action Plan

Source of truth: `docs/planning/final-implementation-plan.md` (immutable)

## 1. Current Status (Assumed)
- Phase 1 implementation has passed integration checkpoint and been pushed.
- Prompt set used for Phase 1 is archived under `docs/prompt/archive/2026-03-10-phase1-v2-executed/`.
- Product direction remains conversion-first:
  - Anonymous wizard
  - Locked primary recommendation
  - Email + consent unlock
  - Primary CTA (`Try it ->`)

## 2. Immediate Goal
Move from "feature complete Phase 1" to "operationally measurable Phase 1" and then start Phase 2 (returning-user account access + history + analytics) without destabilizing conversion flow.

Additional product reality:
- The current app is effectively English-only.
- Frontend copy is still hardcoded in components and should be extracted before multilingual support becomes urgent.
- Internationalization prep should be treated as a Phase 2 foundation task, even if shipping additional locales comes later.
- Current header navigation is too crowded:
  - unauthenticated state exposes `Register`, `Login`, and `Start Wizard` at the same time
  - this is especially weak on mobile, but also feels noisy on desktop
  - `Start Wizard` should not live as a persistent header CTA
- Current wizard navigation is weak on mobile:
  - after selecting a mission or priority, the user may need to scroll to find `Back` / `Continue`
  - this makes the flow feel uncertain and easier to abandon
  - mobile should keep the primary navigation controls persistently visible

## 3. Recommended Work Split for Next Stage

### Agent A: Backend/Core Platform
- Owns:
  - KPI event persistence and queryability
  - Passkey-first auth architecture for Phase 2
  - History APIs
  - Data integrity and performance hardening

### Agent B: Frontend/Product UX
- Owns:
  - Funnel instrumentation points in UI
  - Returning-user Phase 2 UX (passkey-first account entry + history views)
  - Internationalization preparation for UI copy
  - Preserve low-cognitive-load result experience

### Agent C: QA/Release
- Owns:
  - Evidence-based phase gates
  - Regression suite and release decision
  - KPI validation consistency

### Agent D: Integration/PM Gate
- Owns:
  - Contract drift checks
  - Cross-agent merge sequencing
  - Final phase gate report and go/no-go recommendation

## 4. Execution Plan (Sequenced)

## Step 1: Phase 1 Closeout Hardening (P0, immediate)
1. Verify KPI data is measurable end-to-end:
   - wizard completion timing
   - unlock conversion
   - try-it click-through
2. Validate compute API p95 target (<500ms) with reproducible benchmark notes.
3. Confirm production-like CORS/env/deploy config sanity.
4. Freeze release notes for Phase 1 baseline.

Exit gate:
- No P0/P1 defects on conversion funnel.
- KPI data available for go/no-go evaluation.

## Step 2: Phase 2 Design Lock (P0)
1. Resolve Phase 2 auth direction before implementation:
   - adopt `passkey-first auth`
   - keep `email` as the account identifier
   - keep `email fallback / recovery` as a secondary path only
   - do not introduce username as a separate identity field
2. Update the product-plan source of truth before implementation so Phase 2 auth prompts and delivery work from the same decision.
3. Define schema additions for passkey credentials, auth sessions, recovery flow, and history access.
4. Finalize API contracts for:
   - passkey registration options/verification
   - passkey authentication options/verification
   - fallback email recovery / account bootstrap
   - listing user recommendation history
5. Define analytics dashboard contract for funnel: start -> complete -> unlock -> register -> sign-in -> try-it.
6. Define i18n foundation rules:
   - extract all user-facing copy from hardcoded components
   - choose translation key structure and locale-file format
   - decide initial locale fallback behavior
   - keep English as the source locale
7. Define header/navigation UX rules:
   - unauthenticated header should expose one clear primary account/navigation action, not multiple competing CTAs
   - `Start Wizard` should be handled in-page where context supports it, not as a persistent header action
   - mobile header density should be treated as a first-class UX constraint
   - desktop navigation should still feel minimal and intentional, not crowded
8. Define wizard mobile UX rules:
   - `Back` and `Continue` should remain easily reachable on mobile without requiring extra scrolling after making a selection
   - prefer a sticky bottom action bar or equivalent persistent control pattern
   - sticky controls must not obscure option content or validation/error states
   - desktop can remain more relaxed, but control placement should stay predictable across breakpoints

Exit gate:
- Signed-off API + data contract docs for Phase 2.
- Signed-off i18n extraction approach for frontend copy.
- Signed-off header/navigation simplification requirements for auth and landing flows.
- Signed-off mobile wizard navigation requirements.

## Step 3: Phase 2 Implementation Sprint 1 (P1)
1. Backend:
   - passkey registration/authentication endpoints
   - fallback email recovery endpoints
   - user history retrieval endpoints
   - signup_source/channel attribution integrity checks
2. Frontend:
   - returning-user passkey entry flow
   - fallback email recovery UI
   - extract hardcoded UI copy into translation resources
   - simplify header navigation to a single clear unauthenticated action
   - improve wizard mobile navigation with persistent `Back` / `Continue` controls
   - authenticated history page
3. QA:
   - integration tests for passkey + recovery + history
   - verification that extracted copy still renders correctly in English
   - responsive validation for simplified header behavior on mobile and desktop
   - responsive validation for sticky wizard navigation on mobile
   - regression on anonymous conversion-first path

Exit gate:
- Returning users can access their past recommendations.
- No regression in anonymous unlock flow.
- English UX remains unchanged after text extraction.
- Header/navigation feels clear and non-crowded across mobile and desktop.
- Wizard progression controls are always discoverable on mobile.

## Step 4: Phase 2 Implementation Sprint 2 (P1)
1. Implement analytics dashboard views and backend aggregation endpoints.
2. Add channel-level conversion reporting by `signup_source`.
3. Tune UX copy/gate placement based on real conversion data.

Exit gate:
- Dashboard shows reliable funnel and source-based conversion.

## Step 5: Phase 3 Readiness Prep (P2)
1. Draft entitlement model boundaries.
2. Define newsletter personalization data contracts.
3. Set decision trigger for advanced retrieval (only if deterministic scoring quality drops).

## 5. Priority Backlog (Actionable)

## P0
1. KPI measurement completeness audit and fixes.
2. Compute p95 verification report.
3. Phase 2 passkey-first auth decision lock and contract/schema design.

## P1
1. Passkey-first authentication implementation.
2. Recommendation history implementation.
3. Funnel analytics dashboards.
4. Internationalization groundwork: extract UI copy and establish locale infrastructure.
5. Navigation simplification: remove crowded unauthenticated header actions and move wizard entry to context-appropriate surfaces.
6. Mobile wizard action-bar improvement: persistent `Back` / `Continue` controls.

## P2
1. Monetization model scaffolding.
2. Personalization groundwork.

## 6. Merge and Governance Rules
1. Never modify `docs/planning/final-implementation-plan.md`.
2. All agent work must map to plan sections and explicit acceptance criteria.
3. No merge to main without:
   - passing lint/tests/build
   - integration checkpoint approval
   - QA release verdict
4. Use `Go with Mitigations` when KPI evidence is partial; use `Go` only when all phase gate evidence is complete.

## 7. Success Criteria for Next Milestone
1. Phase 1 conversion performance is measurable and stable.
2. Phase 2 passkey-first account access + history foundation is deployed without harming anonymous conversion flow.
3. Funnel analytics is trusted enough for product decisions.
4. English copy is fully externalized and ready for additional locales.
5. Header/navigation hierarchy is clear on mobile and desktop.
6. Wizard progression is obvious and low-friction on mobile.
7. Team can decide Phase 3 investments based on measured behavior, not assumptions.
