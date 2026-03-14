# TrustMeBroAI Status

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Completed

## Current State

- Current phase: `Phase 2`
- Current sprint: `Sprint 3`
- Current status: `In progress`
- Source of truth: `docs/planning/final-implementation-plan.md`
- Internal dev helper: `/tasks-progress` is available during development only and must be removed before go-live.

## Phase 1 -> MVP

### Goal
- Anonymous recommendation flow
- Locked primary recommendation
- Email unlock gate
- Deterministic recommendation engine

### Outcome
- [x] Landing page
- [x] 3-step wizard
- [x] Locked result flow
- [x] Email unlock flow
- [x] Deterministic scoring in runtime
- [x] Curated seed tool dataset in runtime
- [x] Primary recommendation UI
- [x] Feedback capture

## Phase 2 Sprint 1 -> Passkey Auth Foundation

### Goal
- Passkey-first account access
- Email as account identifier
- Email fallback secondary only
- Keep anonymous funnel intact

### Outcome
- [x] Final plan updated to passkey-first
- [x] Passkey registration flow
- [x] Passkey sign-in flow
- [x] Recovery/bootstrap email fallback
- [x] Auth session bootstrap
- [x] Anonymous funnel still open
- [x] QA gate completed
- [x] Integration closeout completed

### Follow-Up UX/Auth Polish
- [x] Preserve and use `requires_passkey_enrollment` after recovery verify
- [x] Real-device passkey validation sweep on desktop and mobile
- [ ] Investigate and eliminate residual `/result` micro-blink for logged-in users during auto-unlock transition
- [ ] Fix iOS Safari post-passkey viewport zoom after passkey sign-in

## Phase 2 Sprint 2 -> Product Foundation

### Goal
- Add authenticated user value
- Prepare English copy for localization
- Add measurable account/funnel signals

### Tasks
- [x] Backend: authenticated recommendation history API
- [x] Backend: account/auth funnel metrics foundation
- [x] Frontend: authenticated recommendation history UI
- [x] Frontend: extract English copy into translation resources
- [x] Frontend: recovery-based passkey enrollment guidance
- [x] QA: history regression gate
- [x] QA: English parity validation after i18n extraction
- [x] QA: real-device passkey validation sweep
- [x] Integration: Sprint 2 closeout and merge gate

## Phase 2 Sprint 3 -> Growth and Recommendation Data Foundation

### Goal
- Ship the separate `follow the build` capture surface
- Start research ingestion implementation from the approved architecture
- Build recommendation evaluation gates
- Close remaining UX/auth polish before broader promotion

### Tasks
- [~] Backend: follow-the-build capture endpoint and source attribution flow
- [~] Backend: research ingestion parser, normalizer, and dry-run artifact generation
- [~] Frontend: landing follow-the-build capture UI
- [~] Frontend: apply approved follow-the-build and loading-copy updates
- [~] Frontend: fix iOS Safari passkey viewport zoom and `/result` micro-blink
- [~] QA: recommendation benchmark suite and ingestion gate harness
- [ ] QA: validate follow-the-build capture, source attribution, and anonymous funnel non-regression
- [ ] Integration: Sprint 3 closeout and merge gate

## Support Workstream -> Marketing and Copy

### Goal
- Audit current product messaging
- Define build-in-public strategy
- Prepare copy direction for future implementation

### Tasks
- [x] Current live copy baseline documented
- [x] Marketing copy audit
- [x] Build-in-public strategy
- [x] Copy recommendations for landing, unlock, auth, and follow-the-build capture
- [~] First 30-day content calendar and channel-ready launch assets
- [~] Final implementation-ready copy pack for the follow-the-build surface

## Support Workstream -> Recommendation Data and Research Ingestion

### Goal
- Define how `docs/research` should safely influence the live tool dataset
- Design evaluation rules for recommendation quality and curation safety
- Avoid premature vector-search or retrieval complexity

### Tasks
- [x] Architect: research-to-dataset ingestion design
- [x] Architect: curation, conflict-resolution, and confidence rules
- [x] Architect: recommendation evaluation and quality-check framework
- [~] Backend: implement approved research ingestion pipeline foundation
- [~] QA: implement ingestion output and recommendation quality gates
- [ ] Controlled first candidate release against research-derived updates
- [x] Decision checkpoint: confirm whether advanced retrieval is still unnecessary

## Phase 3 -> Optimization

### Goal
- Monetization readiness
- Personalization
- Recommendation quality upgrades only if needed

### Tasks
- [ ] Subscription tiers and entitlements
- [ ] Newsletter personalization
- [ ] Advanced retrieval only if deterministic scoring becomes insufficient

## Research and Runtime Reality

### Research
- [x] Research files exist in `docs/research`
- [x] Manual research-to-seed mapping exists
- [x] Curated seed dataset is active in runtime
- [ ] Automated research ingestion pipeline
- [ ] Research exports used directly in runtime

### Runtime Recommendation Engine
- [x] Deterministic scoring
- [x] Category filtering + fallback category logic
- [x] PostgreSQL-backed seeded tool data
- [ ] Vector search
- [ ] Embeddings
- [ ] Runtime use of `docs/research` exports

## Active Documents

- [x] `docs/planning/final-implementation-plan.md`
- [x] `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
- [x] `docs/planning/2026-03-14-phase2-sprint2-backend-history-metrics-enrollment-note.md`
- [x] `docs/planning/2026-03-14-phase2-sprint2-frontend-continuation-note.md`
- [x] `docs/planning/2026-03-14-phase2-sprint2-qa-release-gate-report.md`
- [x] `docs/planning/2026-03-14-phase2-sprint2-integration-closeout-report.md`
- [x] `docs/planning/2026-03-14-recommendation-data-architecture.md`
- [x] `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
- [x] `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`

## Active Prompt Set

- [x] `docs/prompt/2026-03-14-phase2-sprint3-back-end-specialist.md`
- [x] `docs/prompt/2026-03-14-phase2-sprint3-front-end-specialist.md`
- [x] `docs/prompt/2026-03-14-phase2-sprint3-qa-specialist.md`
- [x] `docs/prompt/2026-03-14-phase2-sprint3-integration-specialist.md`
- [x] `docs/prompt/2026-03-14-phase2-sprint3-marketing-content-specialist.md`

## Manager View

- [x] Phase 1 complete
- [x] Phase 2 Sprint 1 complete with mitigations
- [x] Phase 2 Sprint 2 complete
- [ ] Phase 2 Sprint 3 complete
- [ ] Phase 3 started

## Next Work

- [~] Ship follow-the-build capture and source attribution
- [~] Implement research ingestion foundation
- [~] Build recommendation evaluation gates
- [~] Close remaining FE auth/transition polish
- [~] Prepare initial build-in-public content assets

## Go-Live Blockers

- [ ] Delete or disable `/tasks-progress` before production release
