# Research Ingestion Rollout Plan (Phased)

Date: 2026-03-14  
Owner: Recommendation Data Architect  
Status: Proposed for execution

## 1. Objective
Roll out a safe research-to-dataset ingestion capability in phases, aligned with current deterministic recommendation runtime and QA release discipline.

## 2. Sequencing Overview
1. Architect approval (this planning package).
2. Backend implementation of ingestion pipeline and deterministic update artifacts.
3. QA validation and gate automation.
4. Controlled first release on a small change batch.
5. Decision checkpoint on advanced retrieval remains explicitly future-gated.

## 3. Phase-by-Phase Plan
### Phase A: Architecture Sign-Off (Now)
Deliverables:
1. `docs/planning/2026-03-14-recommendation-data-architecture.md`
2. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
3. This rollout plan

Exit criteria:
1. Stakeholders approve eligibility, mapping, conflict, and confidence rules.
2. Stakeholders approve Phase 2 defer decision on vector retrieval.

### Phase B: Backend Foundation Implementation
Owner: Back-End Specialist

Scope:
1. Build parser/normalizer for `docs/research` markdown sources.
2. Generate staging artifacts (`candidate_tools.jsonl`, evidence, conflicts, decisions).
3. Implement deterministic SQL update artifact generation.
4. Provide dry-run mode and apply mode (apply behind explicit confirmation).

Suggested implementation tasks:
1. Add ingestion module under `backend/src/researchIngest/`.
2. Add CLI scripts in `backend/package.json` for dry-run and artifact generation.
3. Add tests for parsing, normalization, and conflict detection.

Exit criteria:
1. Dry-run works on current `docs/research` corpus.
2. Artifacts are reproducible for same inputs.
3. No runtime recommendation API contract changes.

### Phase C: QA Gate and Benchmark Validation
Owner: QA Specialist

Scope:
1. Build benchmark suite and regression harness.
2. Add release-gate checks based on evaluation framework thresholds.
3. Define evidence outputs for go/no-go decisions.

Suggested tasks:
1. Create benchmark fixtures covering categories/priorities/fallbacks.
2. Create gate script to compare baseline vs candidate datasets.
3. Add release evidence templates under `docs/planning/release-evidence/`.

Exit criteria:
1. Gate script blocks failing candidates.
2. Manual review protocol is actionable and repeatable.
3. Release evidence bundle is produced automatically.

### Phase D: First Controlled Candidate Release
Owners: Back-End + QA + Integration

Scope:
1. Run first candidate with limited tool changes.
2. Execute full evaluation gates.
3. Apply only if all hard gates pass.

Exit criteria:
1. First candidate applied without contract regressions.
2. Post-apply monitoring shows no critical funnel degradation.
3. Retrospective documented with threshold-tuning recommendations.

### Phase E: Operationalization
Owners: Back-End + QA

Scope:
1. Move ingestion/evaluation into regular cadence.
2. Define change windows and approver rotation.
3. Introduce optional CI workflow automation once manual flow is stable.

Exit criteria:
1. At least 3 successful release cycles.
2. Thresholds updated using real evidence.
3. Operational handbook documented.

## 4. RACI
1. Architect: rules and decision boundaries.
2. Back-End Specialist: parser, normalizer, SQL artifact generator, transactional apply path.
3. QA Specialist: benchmark suite, gate thresholds, release-evidence verification.
4. Integration Specialist: cross-stream merge safety and non-regression signoff.

## 5. Risks and Mitigations
1. Risk: noisy research data causes low-confidence updates.
   - Mitigation: strict confidence thresholds and conflict blocking.
2. Risk: high recommendation churn from minor data edits.
   - Mitigation: regression thresholds + pinned scenarios.
3. Risk: scope creep into retrieval redesign.
   - Mitigation: explicit non-goals and future-gated retrieval decision.
4. Risk: release process too manual/slow.
   - Mitigation: phase automation after stable baseline process.

## 6. Decision Checkpoint: Advanced Retrieval (Future-Gated)
Timing: after minimum 3 ingestion release cycles and post-release metrics review.

Decision input package must include:
1. Benchmark trend over releases.
2. Failure analysis showing whether misses are data-quality vs semantic-retrieval limitations.
3. Operational overhead of current deterministic model.

Default outcome remains: continue deterministic scoring unless evidence clearly supports retrieval expansion.

## 7. Immediate Next Actions
1. Assign Back-End implementation ticket for ingestion foundation.
2. Assign QA ticket for benchmark/gate harness.
3. Schedule integration checkpoint after Phase B and Phase C complete.
4. Keep `docs/planning/final-implementation-plan.md` unchanged during this workstream.

## 8. Success Definition
1. Research updates become structured, auditable, and test-gated.
2. Recommendation quality is measured before merge, not guessed after deploy.
3. Deterministic one-answer product behavior remains stable.
4. Retrieval complexity stays deferred until objective triggers are met.
