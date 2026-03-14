## 1. Feature Title
`Phase 2 Sprint 4 Back-End Specialist: Controlled Candidate Release Support`

## 2. Objective
Implement the backend support needed for the first controlled research-ingestion candidate release. The goal is to move from dry-run-only foundation to a guarded, auditable candidate-release path without widening the runtime recommendation model or weakening safety.

## 3. Context
- Product area: `Recommendation-data operations and release safety`
- Current behavior: `Sprint 3 completed the follow-the-build capture and the ingestion dry-run foundation. Architect and QA scaffolding are in place. The next missing backend piece is controlled candidate-release support for approved ingestion artifacts.`
- Problem to solve: `We need a safe, explicit backend path from approved ingestion artifacts to a controlled candidate release, with strong auditability and no accidental runtime drift.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-recommendation-data-architecture.md`
5. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
6. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`
7. `docs/planning/release-evidence/`

## 4. Scope
- In scope:
  1. Implement a guarded apply path or equivalent candidate-release support for approved ingestion artifacts.
  2. Preserve explicit dry-run vs apply boundaries.
  3. Support release-evidence generation and traceability where backend-owned.
  4. Keep current runtime recommendation semantics unchanged.
- Out of scope:
  1. Vector or semantic retrieval.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Broad recommendation algorithm changes.
  4. Frontend/UI work.

## 5. Requirements
1. Candidate release support must be explicit, auditable, and non-accidental.
2. Dry-run and apply paths must remain clearly separated.
3. Apply path must only operate on approved artifacts and be safe to abort.
4. Runtime recommendation contract and scoring behavior must remain unchanged aside from approved data updates.
5. Backend outputs must remain compatible with QA release-evidence expectations.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Keep the ingestion architecture curation-first and artifact-first.
3. Use transactional safety for any candidate apply operation.
4. Do not introduce raw `docs/research` reads into runtime API paths.
5. Keep implementation narrow and deterministic.

## 7. Implementation Notes
1. Build from the existing dry-run foundation rather than replacing it.
2. Require explicit input artifacts and clear confirmation boundaries for any apply-capable path.
3. Preserve provenance and decision traceability from artifact generation through candidate release support.
4. If a full apply path is too risky in this slice, implement the safest narrower backend support that still enables a real controlled candidate release with QA.
5. Add or update a short backend planning note under `docs/planning/` documenting:
   - candidate-release command(s)
   - guardrails
   - rollback/abort assumptions

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - guarded candidate-release path behavior
   - explicit rejection of invalid/unapproved artifact inputs
   - transactional safety or equivalent failure handling
   - non-regression of existing recommendation behavior where touched

## 9. Acceptance Criteria
1. Backend can support the first controlled candidate release safely.
2. Dry-run and apply boundaries are explicit and test-backed.
3. Recommendation runtime semantics remain stable.
4. QA and Integration can run the first controlled candidate release with evidence.

## 10. Deliverables
1. Backend code for controlled candidate-release support.
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
  1. QA will run the first real controlled candidate release after this backend support lands.
- Open questions:
  1. Is a rollback command required in this slice, or is transactional failure safety sufficient for the first controlled release?
