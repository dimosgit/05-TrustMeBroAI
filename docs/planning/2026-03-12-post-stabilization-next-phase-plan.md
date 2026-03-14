# TrustMeBroAI Post-Stabilization Next Phase Plan

Source of truth: `docs/planning/final-implementation-plan.md` remains authoritative until intentionally updated.

## 1. Current State
- The immediate stabilization issues from earlier Phase 2 work have been addressed:
  - authenticated-user unlock regression
  - result-page hierarchy issue
  - crowded header navigation
  - weak mobile wizard progression controls
- Phase 2 Sprint 2 is now complete and integration-approved:
  - authenticated recommendation history is live
  - English copy is extracted for i18n readiness
  - account/auth funnel metrics foundation is in place
  - recovery-based passkey-enrollment guidance is wired through
- Marketing strategy work is complete:
  - copy audit
  - build-in-public strategy
  - copy recommendations
- Recommendation-data architecture work is complete:
  - research ingestion architecture
  - recommendation evaluation framework
  - rollout plan
- Remaining UX/auth polish follow-ups:
  - residual `/result` micro-blink for logged-in users during auto-unlock
  - iOS Safari post-passkey viewport zoom

## 2. Immediate Next Goal
Move from completed Phase 2 Sprint 2 into Phase 2 Sprint 3: growth and recommendation-data foundation.

This means:
1. implement the separate `follow the build` capture required by the final plan
2. carry the architected research-ingestion design into backend foundation work
3. build QA benchmark and release-gate scaffolding for dataset updates
4. apply the highest-priority marketing copy recommendations in product surfaces
5. close remaining auth/transition polish without regressing the anonymous funnel

## 3. Priority Order

### P0: Follow-the-Build Capture
1. Add the landing-page `follow the build` capture surface.
2. Persist separate `signup_source` attribution for this path.
3. Keep it analytically distinct from recommendation unlock conversion.

### P0: Research Ingestion Foundation
1. Implement the curation-first ingestion pipeline foundation from the architect docs.
2. Generate deterministic staging artifacts and dry-run output.
3. Keep raw research out of runtime and preserve the current deterministic recommendation contract.

### P1: Recommendation Evaluation Gates
1. Create benchmark scenarios and release-evidence scaffolding.
2. Add QA harnesses to compare baseline vs candidate dataset behavior.

### P1: UX/Auth Polish
1. Fix iOS Safari post-passkey viewport zoom.
2. Eliminate residual `/result` micro-blink during logged-in auto-unlock.

## 4. Implementation Plan

### Sprint 3: Growth and Recommendation Data Foundation
1. Backend:
   - implement a dedicated follow-the-build capture endpoint and persistence path
   - implement research-ingestion parser/normalizer foundation
   - generate deterministic staging artifacts and dry-run output
2. Frontend:
   - implement the landing follow-the-build capture surface
   - apply approved follow-the-build copy and wizard loading-copy refinement
   - fix iOS Safari passkey zoom and residual result micro-blink
3. QA:
   - validate follow-the-build capture and source attribution
   - create benchmark suite and release-gate scaffolding from the evaluation framework
   - protect anonymous funnel and passkey stability
4. Integration:
   - reconcile capture contract, ingestion artifacts, and QA evidence
   - block merge on funnel regression or ingestion-governance drift
5. Marketing:
   - convert strategy into channel-ready launch assets and implementation-ready follow-the-build copy

Exit gate:
- Follow-the-build capture is live and separately attributable.
- Research-ingestion foundation exists as a dry-run, artifact-producing path.
- Benchmark/evaluation scaffolding exists for the first controlled ingestion release.
- Remaining FE auth/transition polish is either fixed or explicitly accepted with evidence.

## 5. Recommended Agent Sequence
1. `Back-End Specialist`, `Front-End Specialist`, and `Marketing Content Specialist` start in parallel.
2. `QA Specialist` starts early on benchmark design and real-browser polish validation, then runs the full Sprint 3 regression gate after FE/BE land.
3. `Integration Specialist` closes the batch last and confirms ingestion governance, funnel safety, and route hygiene remain intact.

## 6. Practical Advice
1. Keep the separate follow-the-build audience distinct from unlock-conversion analytics.
2. Implement research ingestion as curation-first staging artifacts, not raw runtime reads.
3. Do not introduce vector or semantic retrieval in this sprint.
4. Keep anonymous recommendation flow protected as a standing regression gate in every PR.
5. The internal `/tasks-progress` route may exist during development for execution visibility, but it must remain disabled by default and should still be removed before go-live.

## 7. Success Criteria
1. Follow-the-build capture is implemented and measurable as a separate channel.
2. Research ingestion has a deterministic, auditable foundation.
3. Recommendation evaluation gates are defined in code or scaffolding, not only on paper.
4. Anonymous wizard conversion remains strong while growth surfaces are added.
5. Remaining FE auth/transition polish is reduced before broader promotion.

## 8A. Recommendation Data Architecture Result
Purpose:
1. Define how the research documents in `docs/research/` should safely feed the live `tools` dataset.
2. Define curation, normalization, conflict-resolution, and confidence rules.
3. Define recommendation-quality evaluation before any larger-scale ingestion or retrieval changes.

Architect outputs now available:
1. `docs/planning/2026-03-14-recommendation-data-architecture.md`
2. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
3. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`

Key decisions now locked for the next implementing agents:
1. Use a curation-first ingestion pipeline.
2. Generate staging artifacts before any DB updates.
3. Keep runtime deterministic and SQL-local.
4. Defer vector/semantic retrieval unless later triggers are met.

Explicit boundaries:
1. This workstream is not permission to introduce vector search immediately.
2. This workstream should not change the product promise or UI model.
3. The next outcome is backend and QA implementation against the approved design, not a broad runtime rewrite.

## 9. Current Execution Batch (2026-03-14)
1. `Back-End Specialist`
   - follow-the-build capture endpoint and source attribution flow
   - research-ingestion parser, normalizer, and dry-run artifact generation
2. `Front-End Specialist`
   - landing follow-the-build capture UI
   - approved follow-the-build and loading-copy updates
   - iOS Safari zoom and residual result micro-blink fixes
3. `QA Specialist`
   - recommendation benchmark suite and ingestion gate harness
   - follow-the-build capture/source attribution validation
   - anonymous-funnel and auth-polish regression gate
4. `Integration Specialist`
   - capture contract reconciliation
   - ingestion-governance review
   - Sprint 3 closeout and merge gate
5. `Marketing Content Specialist`
   - implementation-ready follow-the-build copy pack
   - first 30-day content calendar
   - initial channel-ready launch assets

## 10. Pre-Go-Live Internal Tooling Gate
1. `/tasks-progress` is an internal development helper only.
2. Production release is blocked until `/tasks-progress` is removed or disabled from the shipped app.
3. QA and Integration must explicitly verify this before go-live signoff.
