# TrustMeBroAI Status

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Completed

## Current State

- Current phase: `Phase 2`
- Current sprint: `Sprint 5`
- Current status: `In progress`
- Source of truth: `docs/planning/final-implementation-plan.md`
- Internal dev helper: `/tasks-progress` is available during development only and must be removed before go-live.

## Archived Completed Phases and Sprints

- [x] Phase 1 -> MVP archived
  - Outcome: anonymous wizard, locked recommendation flow, email unlock gate, deterministic runtime scoring, curated seed dataset, feedback capture
- [x] Phase 2 Sprint 1 -> Passkey Auth Foundation archived
  - Outcome: passkey-first auth, recovery/bootstrap fallback, auth session bootstrap, anonymous funnel preserved
  - Follow-up carried into Sprint 4: FE auth polish for iOS Safari zoom and residual `/result` micro-blink
- [x] Phase 2 Sprint 2 -> Product Foundation archived
  - Outcome: authenticated recommendation history, funnel/account metrics foundation, English copy extraction, QA and integration closeout
- [x] Phase 2 Sprint 3 -> Growth and Recommendation Data Foundation archived
  - Outcome: follow-the-build capture live, research-ingestion dry-run foundation, benchmark/evidence scaffolding, integration closeout
- [x] Phase 2 Sprint 4 -> Controlled Candidate Release and FE Polish archived
  - Outcome: first controlled candidate release executed, candidate release decision closed, FE polish mitigations shipped
  - Carryover into Sprint 5: Safari real-device evidence closure and verified-email unlock enforcement

## Phase 2 Sprint 5 -> Verified Email Gate and Release Hardening

### Goal
- Enforce verified-email-only primary recommendation unlock
- Prevent random or mistyped emails from unlocking results
- Start newsletter foundation on top of verified-email-only records
- Close the remaining Safari real-device validation carryover
- Keep candidate-release governance and anonymous funnel safety intact

### Tasks
- [~] Backend: add verification-link request/verify flow for recommendation unlock
- [~] Backend: store verification status and verification-token lifecycle for unlock emails
- [~] Frontend: add verification-pending unlock state and verification-return handling
- [~] Frontend: update unlock messaging to make verification-link requirement explicit
- [~] QA: verify that unverified emails cannot unlock the primary recommendation
- [ ] Backend: add newsletter subscription state and unsubscribe flow for verified emails
- [ ] Backend: add provider sync/export path for verified subscribed emails
- [ ] QA: prove unverified and unsubscribed emails never receive newsletter sends
- [~] QA + FE: run fresh iOS Safari real-device validation for passkey zoom and `/result` transition evidence pack
- [ ] Integration: Sprint 5 closeout, verified-email gate review, and release hardening decision

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
- [x] First 30-day content calendar and channel-ready launch assets
- [x] Final implementation-ready copy pack for the follow-the-build surface

## Support Workstream -> Recommendation Data and Research Ingestion

### Goal
- Define how `docs/research` should safely influence the live tool dataset
- Design evaluation rules for recommendation quality and curation safety
- Avoid premature vector-search or retrieval complexity

### Tasks
- [x] Architect: research-to-dataset ingestion design
- [x] Architect: curation, conflict-resolution, and confidence rules
- [x] Architect: recommendation evaluation and quality-check framework
- [x] Backend: implement approved research ingestion pipeline foundation
- [x] QA: implement ingestion output and recommendation quality gates
- [x] Controlled first candidate release against research-derived updates
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
- [x] `docs/planning/2026-03-14-newsletter-email-strategy.md`
- [x] `docs/planning/2026-03-14-phase2-sprint3-backend-follow-build-ingestion-note.md`
- [x] `docs/planning/2026-03-14-phase2-sprint3-qa-release-gate-report.md`
- [x] `docs/planning/2026-03-14-phase2-sprint3-integration-closeout-report.md`
- [x] `docs/planning/2026-03-14-recommendation-data-architecture.md`
- [x] `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
- [x] `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`

## Active Prompt Set

- [x] Last implemented batch: Sprint 4 specialist prompts
- [ ] Generate Sprint 5 specialist prompts for verified-email gate work

## Manager View

- [x] Phase 1 complete
- [x] Phase 2 Sprint 1 complete with mitigations
- [x] Phase 2 Sprint 2 complete
- [x] Phase 2 Sprint 3 complete
- [x] Phase 2 Sprint 4 complete
- [ ] Phase 2 Sprint 5 complete
- [ ] Phase 3 started

## Next Work

- [~] Enforce verification-link ownership confirmation before primary unlock
- [~] Add newsletter subscription foundation for verified emails, unsubscribe handling, and provider sync/export
- [~] Execute Safari real-device validation carryover in Sprint 5
- [~] Keep candidate-release governance exceptions tracked until scenario-level evaluator is implemented

## Go-Live Blockers

- [ ] Delete or disable `/tasks-progress` before production release
