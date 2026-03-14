# TrustMeBroAI Post-Stabilization Next Phase Plan

Source of truth: `docs/planning/final-implementation-plan.md` remains authoritative until intentionally updated.

## 1. Current State
- The immediate stabilization issues from earlier Phase 2 work have been addressed:
  - authenticated-user unlock regression
  - result-page hierarchy issue
  - crowded header navigation
  - weak mobile wizard progression controls
- Phase 2 Sprint 3 is now complete and integration-approved:
  - follow-the-build capture is live end to end
  - research-ingestion dry-run foundation is implemented
  - benchmark and release-evidence scaffolding exists
  - internal route hygiene remains safe by default
- Marketing execution assets are complete:
  - follow-the-build copy pack
  - 30-day content calendar
  - launch post pack
- Remaining FE/auth polish follow-ups:
  - residual `/result` micro-blink for logged-in users during auto-unlock
  - iOS Safari post-passkey viewport zoom still needs fresh validation after a fix

## 2. Immediate Next Goal
Move from completed Phase 2 Sprint 3 into Phase 2 Sprint 4: controlled candidate release and FE polish closeout.

This means:
1. execute the first controlled research-ingestion candidate release
2. generate real release evidence using the architected evaluation framework
3. implement and re-validate the remaining FE auth polish issues
4. keep anonymous funnel and internal route hygiene safe throughout

## 3. Priority Order

### P0: Controlled Candidate Release
1. Add a guarded apply path for the first research-ingestion candidate release.
2. Use curated decisions and dry-run artifacts as inputs.
3. Preserve deterministic runtime behavior and transactional safety.

### P0: Release Evidence and QA Gate Execution
1. Produce the first real release-evidence bundle.
2. Compare baseline vs candidate behavior using the benchmark framework.

### P1: FE/Auth Polish Closeout
1. Fix iOS Safari post-passkey viewport zoom.
2. Eliminate residual `/result` micro-blink during logged-in auto-unlock.

## 4. Implementation Plan

### Sprint 4: Controlled Candidate Release and FE Polish
1. Backend:
   - implement a guarded apply path for approved research-ingestion artifacts
   - support the first controlled candidate release without widening runtime scope
2. Frontend:
   - fix iOS Safari passkey zoom
   - eliminate residual `/result` micro-blink
3. QA:
   - execute the first controlled candidate release against benchmark and evidence gates
   - attach fresh Safari/device validation evidence after FE fixes
4. Integration:
   - reconcile candidate release safety, evidence completeness, and FE regression closure

Exit gate:
- First controlled research-ingestion candidate release has evidence and a clear go/no-go decision.
- FE auth polish issues are either fixed and validated or explicitly accepted with evidence.
- No regression in anonymous funnel or route hygiene.

## 5. Recommended Agent Sequence
1. `Back-End Specialist` and `Front-End Specialist` start in parallel.
2. `QA Specialist` prepares candidate-release execution and real-device revalidation, then runs the full Sprint 4 gate after FE/BE land.
3. `Integration Specialist` closes the batch last and decides readiness for the first controlled candidate release.

## 6. Practical Advice
1. Keep controlled candidate release scope intentionally small.
2. Preserve the curation-first, artifact-first architecture decisions already approved.
3. Do not introduce vector or semantic retrieval in this sprint.
4. Keep anonymous recommendation flow protected as a standing regression gate in every PR.
5. The internal `/tasks-progress` route must remain disabled by default and should still be removed before go-live.

## 7. Success Criteria
1. First controlled candidate release is executed with evidence.
2. Research-ingestion governance holds under a real release candidate, not just dry-run.
3. Remaining FE auth polish issues are reduced with fresh validation evidence.
4. Anonymous wizard conversion and route hygiene remain safe.

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
   - guarded apply path for approved ingestion artifacts
   - controlled candidate release backend support
2. `Front-End Specialist`
   - iOS Safari zoom fix
   - residual result micro-blink fix
3. `QA Specialist`
   - controlled candidate release execution
   - release-evidence bundle
   - fresh Safari/device validation
4. `Integration Specialist`
   - candidate release decision
   - FE polish closeout review
   - Sprint 4 merge gate

## 10. Pre-Go-Live Internal Tooling Gate
1. `/tasks-progress` is an internal development helper only.
2. Production release is blocked until `/tasks-progress` is removed or disabled from the shipped app.
3. QA and Integration must explicitly verify this before go-live signoff.
