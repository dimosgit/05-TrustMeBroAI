## 1. Feature Title
`Phase 2 Sprint 3 Back-End Specialist: Follow-the-Build Capture and Research Ingestion Foundation`

## 2. Objective
Implement the backend slice of Phase 2 Sprint 3 by shipping a separate follow-the-build capture path and starting the approved research-ingestion foundation. The goal is to support growth without mixing analytics intent, and to turn the architected recommendation-data design into a deterministic, auditable backend pipeline foundation.

## 3. Context
- Product area: `Growth capture and recommendation-data operations`
- Current behavior: `Phase 2 Sprint 2 is complete. Marketing strategy is complete. Recommendation-data architecture is complete. The app still lacks the follow-the-build capture required by the final plan, and research documents are still not processed through an automated ingestion path.`
- Problem to solve: `We need backend support for a separate build-in-public capture flow and the first implementation slice of the architected research-ingestion pipeline.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-recommendation-data-architecture.md`
5. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
6. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`
7. `docs/marketing/2026-03-14-build-in-public-strategy.md`
8. `docs/marketing/2026-03-14-copy-recommendations.md`

## 4. Scope
- In scope:
  1. Implement a backend endpoint or service path for separate follow-the-build email capture.
  2. Persist distinct `signup_source` attribution for follow-the-build signups.
  3. Start the research-ingestion backend foundation:
     - parser/normalizer
     - deterministic staging artifacts
     - dry-run execution path
  4. Preserve existing deterministic recommendation runtime behavior.
- Out of scope:
  1. Runtime use of raw `docs/research` content.
  2. Vector or semantic retrieval implementation.
  3. Editing `docs/planning/final-implementation-plan.md`.
  4. Frontend landing implementation beyond contract support.

## 5. Requirements
1. Follow-the-build signups must remain analytically distinct from unlock and account flows.
2. The backend must provide a safe, consent-aware capture path for follow-the-build emails.
3. Research ingestion must produce deterministic artifacts before any DB update path.
4. Initial ingestion foundation must align with the approved architect outputs:
   - curation-first
   - auditable
   - conflict-aware
   - dry-run capable
5. Existing recommendation API behavior and scoring contract must remain unchanged.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Keep research ingestion strictly non-runtime in this slice.
3. Do not auto-apply DB changes from research in this first implementation slice unless fully dry-run gated and explicitly justified.
4. Use staging artifacts and deterministic generation paths exactly in spirit of the architect docs.
5. Preserve current auth, unlock, and recommendation behavior.

## 7. Implementation Notes
1. Follow-the-build capture should store a distinct `signup_source`, recommended as `follow_the_build`.
2. If a new endpoint is needed, keep it lightweight and validation-first.
3. For ingestion foundation, target the architect-recommended staging area shape under `backend/db/staging/research_ingest/`.
4. Implement at least:
   - source discovery
   - normalization into candidate records
   - evidence/provenance capture
   - conflict artifact generation
   - dry-run command path
5. If SQL update artifact generation is feasible in this slice, keep it dry-run only unless the integration and QA gates explicitly support more.
6. Add or update a short backend planning note under `docs/planning/` documenting:
   - capture endpoint contract
   - ingestion commands
   - staging artifact outputs

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - follow-the-build capture validation and persistence
   - separate `signup_source` attribution
   - research-ingestion parser/normalizer determinism
   - artifact generation and conflict reporting
   - no regression in existing recommendation/auth behavior where touched

## 9. Acceptance Criteria
1. Follow-the-build capture is supported by a backend contract distinct from unlock/account flows.
2. Research ingestion foundation exists as a deterministic, dry-run-capable backend path.
3. Raw research is still not used directly in runtime.
4. Existing product flows remain stable.

## 10. Deliverables
1. Backend code for follow-the-build capture and ingestion foundation.
2. Test changes proving correctness and non-regression.
3. A short backend planning note under `docs/planning/`.
4. Short implementation summary including exact test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Follow-the-build capture can reuse existing user/lead persistence patterns with a distinct source marker.
  2. This slice is foundation work, not the first approved dataset-apply release.
- Open questions:
  1. Should follow-the-build capture live in the same user table path as unlock-created users, or in a separate lead-specific path that later syncs?
