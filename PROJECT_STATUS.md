# TrustMeBroAI Status

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Completed

## Current State

- Current phase: `Phase 2`
- Current sprint: `Sprint 4`
- Current status: `Sprint 4 complete with carryover`
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

## Phase 2 Sprint 4 -> Controlled Candidate Release and FE Polish

### Goal
- Run the first controlled research-ingestion candidate release
- Attach real release evidence to recommendation-data updates
- Close the remaining FE auth/transition polish issues

### Tasks
- [x] Backend: guarded apply path and candidate-release support for research ingestion
- [x] Frontend: fix iOS Safari passkey viewport zoom
- [x] Frontend: eliminate residual `/result` micro-blink during auto-unlock
- [x] QA: execute first controlled candidate release with benchmark and release-evidence bundle
- [x] Integration: Sprint 4 closeout and candidate release decision

### Carryover to Next Sprint
- [ ] QA + FE: fresh real-device Safari validation for zoom and `/result` transition evidence pack

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
- [x] `docs/planning/2026-03-14-phase2-sprint3-backend-follow-build-ingestion-note.md`
- [x] `docs/planning/2026-03-14-phase2-sprint3-qa-release-gate-report.md`
- [x] `docs/planning/2026-03-14-phase2-sprint3-integration-closeout-report.md`
- [x] `docs/planning/2026-03-14-recommendation-data-architecture.md`
- [x] `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
- [x] `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`

## Active Prompt Set

- [x] `docs/prompt/2026-03-14-phase2-sprint4-back-end-specialist.md`
- [x] `docs/prompt/2026-03-14-phase2-sprint4-front-end-specialist.md`
- [x] `docs/prompt/2026-03-14-phase2-sprint4-qa-specialist.md`
- [x] `docs/prompt/2026-03-14-phase2-sprint4-integration-specialist.md`

## Manager View

- [x] Phase 1 complete
- [x] Phase 2 Sprint 1 complete with mitigations
- [x] Phase 2 Sprint 2 complete
- [x] Phase 2 Sprint 3 complete
- [x] Phase 2 Sprint 4 complete
- [ ] Phase 3 started

## Next Work

- [~] Execute Safari real-device validation carryover in next sprint
- [~] Keep candidate-release governance exceptions tracked until scenario-level evaluator is implemented

## Go-Live Blockers

- [ ] Delete or disable `/tasks-progress` before production release
