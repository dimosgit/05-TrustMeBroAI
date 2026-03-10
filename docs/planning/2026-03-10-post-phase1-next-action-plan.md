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
Move from "feature complete Phase 1" to "operationally measurable Phase 1" and then start Phase 2 (returning-user login + history + analytics) without destabilizing conversion flow.

## 3. Recommended Work Split for Next Stage

### Agent A: Backend/Core Platform
- Owns:
  - KPI event persistence and queryability
  - Magic-link architecture for Phase 2
  - History APIs
  - Data integrity and performance hardening

### Agent B: Frontend/Product UX
- Owns:
  - Funnel instrumentation points in UI
  - Returning-user Phase 2 UX (magic-link entry + history views)
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
1. Finalize magic-link auth design (passwordless, no password flow).
2. Define schema additions for login tokens/session/history access.
3. Finalize API contracts for:
   - requesting login link
   - consuming login link
   - listing user recommendation history
4. Define analytics dashboard contract for funnel: start -> complete -> unlock -> try-it.

Exit gate:
- Signed-off API + data contract docs for Phase 2.

## Step 3: Phase 2 Implementation Sprint 1 (P1)
1. Backend:
   - magic-link request/verify endpoints
   - user history retrieval endpoints
   - signup_source/channel attribution integrity checks
2. Frontend:
   - returning-user entry flow
   - authenticated history page
3. QA:
   - integration tests for magic-link + history
   - regression on anonymous conversion-first path

Exit gate:
- Returning users can access their past recommendations.
- No regression in anonymous unlock flow.

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
3. Phase 2 magic-link contract and schema design lock.

## P1
1. Magic-link implementation.
2. Recommendation history implementation.
3. Funnel analytics dashboards.

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
2. Phase 2 login + history foundation is deployed without harming anonymous conversion flow.
3. Funnel analytics is trusted enough for product decisions.
4. Team can decide Phase 3 investments based on measured behavior, not assumptions.
