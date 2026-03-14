## 1. Feature Title
`Recommendation Data Architect: Research Ingestion, Curation Rules, and Evaluation Framework`

## 2. Objective
Design the architecture for safely using the repository research documents to improve and maintain the live recommendation dataset. The goal is to define a pragmatic Phase 2 recommendation-data pipeline and evaluation framework without prematurely introducing vector search or rewriting the deterministic recommendation model.

## 3. Context
- Product area: `Recommendation data architecture and research-ingestion design`
- Current behavior: `The live app uses curated seeded tool data plus deterministic SQL-local scoring. Research files exist in docs/research and manual research-to-seed mapping exists, but there is no automated ingestion pipeline and the research exports are not used directly in runtime.`
- Problem to solve: `This work is under-owned today. We need an architected plan for how research should influence the live dataset, how quality and conflicts are handled, and when advanced retrieval should or should not be reconsidered.`

Planning and repo references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/archive/phase1/2026-03-10-phase1-research-to-seed-utilization.md`
5. `docs/research/`
6. `backend/db/init/002_seed.sql`
7. `backend/src/services/recommendationService.js`
8. `backend/src/repositories/toolRepository.js`

## 4. Scope
- In scope:
  1. Define a safe research-to-dataset ingestion architecture for Phase 2.
  2. Define normalization, curation, conflict-resolution, and confidence rules.
  3. Define how ingestion should interact with the current `tools` data model and deterministic scoring model.
  4. Define a recommendation-quality evaluation framework for future ingestion changes.
  5. Decide whether advanced retrieval remains out of scope for now and document the decision clearly.
- Out of scope:
  1. Direct implementation of the ingestion pipeline.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Immediate vector-store or embedding rollout.
  4. Frontend/UI changes.

## 5. Requirements
1. Treat the current deterministic scoring model as the active runtime baseline.
2. Produce a recommendation-data architecture that starts with safe dataset updates before any retrieval-model expansion.
3. Explicitly define:
   - source file eligibility from `docs/research`
   - field mapping into `tools`
   - normalization rules
   - curation override rules
   - conflict-resolution rules
   - confidence scoring or confidence labeling
4. Define how recommendation quality should be evaluated after dataset updates:
   - offline checks
   - curated benchmark scenarios
   - regression criteria
   - human review needs
5. Explicitly answer whether vector or semantic retrieval should remain deferred, and why.
6. Keep the output realistic for this product and current plan.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Use the current repo and active planning docs as the source of truth for current runtime behavior.
3. Do not assume that `docs/research` content is clean or runtime-ready.
4. Do not let the design drift into a general AI-search architecture if the current product does not need it.
5. Preserve the one-answer deterministic recommendation model as the current default unless you can justify a later decision checkpoint.

## 7. Implementation Notes
1. Start by documenting current reality:
   - what is live now
   - what is manual now
   - where the current gaps are
2. Produce the following documents under `docs/planning/`:
   - `docs/planning/2026-03-14-recommendation-data-architecture.md`
   - `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
   - `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`
3. The architecture doc should define the recommended system shape and boundaries.
4. The evaluation framework should define how dataset and recommendation-quality changes are judged before merge.
5. The rollout plan should sequence:
   - architect approval
   - backend implementation
   - QA validation
   - later decision checkpoint on advanced retrieval
6. If you recommend future vector or semantic retrieval, keep it as a clearly gated future option, not a current-phase requirement.

## 8. Test Requirements
1. No application code changes are required in this task.
2. Validation before commit:
   - confirm all recommendations are grounded in current repo files and active planning docs
   - confirm all new files are saved under `docs/planning/`
   - confirm the work does not modify `docs/planning/final-implementation-plan.md`
3. Do not create a commit if the deliverables are incomplete or not grounded in repo evidence.

## 9. Acceptance Criteria
1. We have a clear architecture for research-to-dataset ingestion.
2. We have written curation and confidence rules instead of implicit assumptions.
3. We have a concrete recommendation-quality evaluation framework.
4. We have an explicit decision on why advanced retrieval is or is not still deferred.
5. Backend and QA can implement and validate the next stage without inventing the architecture themselves.

## 10. Deliverables
1. `docs/planning/2026-03-14-recommendation-data-architecture.md`
2. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
3. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`
4. A short implementation summary stating:
   - repo sources reviewed
   - major design decisions
   - recommended next implementing agents

## 11. Mandatory Agent Rules
1. Ground every recommendation in the current repo state.
2. Do not edit application code in this task unless explicitly asked later.
3. Do not modify `docs/planning/final-implementation-plan.md`.
4. Keep the design concrete, phased, and implementation-ready.
5. Escalate contradictions instead of inventing product direction.

## 12. Assumptions and Open Questions
- Assumptions:
  1. The first step should be architecture and evaluation design, not direct implementation.
  2. Current deterministic scoring remains the live baseline during this workstream.
- Open questions:
  1. What size or failure threshold should trigger reconsideration of advanced retrieval beyond structured scoring?
