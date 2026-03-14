## 1. Feature Title
`Phase 2 Sprint 4 Back-End Specialist: Candidate Release Blocker Remediation`

## 2. Objective
Unblock Sprint 4 QA by making the first controlled candidate release actually eligible for apply. The goal is to move from `approved=0` and unresolved conflicts to a bounded approved subset that can pass guarded apply with full evidence.

## 3. Context
- Product area: `Research ingestion candidate release execution`
- Current behavior: `Dry-run succeeds, but guarded apply fails with "No approved tools found in curation decisions".`
- Problem to solve: `Sprint 4 QA is blocked because candidate governance eligibility is not met.`

References:
1. `docs/planning/2026-03-14-phase2-sprint4-qa-release-gate-report.md`
2. `docs/planning/release-evidence/2026-03-14-sprint4-candidate-001/`
3. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
4. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`
5. `docs/planning/final-implementation-plan.md` (immutable)

## 4. Scope
- In scope:
  1. Curate a bounded approved candidate subset in staging artifacts.
  2. Resolve conflicts for approved tool slugs.
  3. Ensure approved candidates satisfy required runtime fields and confidence gates.
  4. Execute guarded apply successfully for a new release id.
  5. Produce backend-owned apply evidence for QA.
- Out of scope:
  1. Editing `docs/planning/final-implementation-plan.md`.
  2. Vector/retrieval redesign.
  3. Frontend/UI changes.

## 5. Requirements
1. Use a new release id: `2026-03-14-sprint4-candidate-002`.
2. Update `backend/db/staging/research_ingest/curation_decisions.json` with explicit `approve` decisions for a small safe subset.
3. For every approved slug, remove or resolve blocking entries from `candidate_conflicts.json`.
4. Do not approve records with missing required runtime fields (`tool_name`, `tool_slug`, `website`, `category`, pricing/scores).
5. Guarded apply must succeed and generate:
   - `docs/planning/release-evidence/2026-03-14-sprint4-candidate-002/backend-apply-summary.json`
6. Keep runtime recommendation semantics unchanged (data update only).

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Keep apply strictly guarded (`--confirm APPLY_CANDIDATE_RELEASE`).
3. Keep changes deterministic and auditable in staging artifacts.
4. Prefer a small high-confidence candidate batch over broad risky approval.

## 7. Implementation Notes
1. Start from a fresh dry-run before curation:
   - `cd backend && npm run research:ingest:dry-run`
2. Review candidate artifacts:
   - `candidate_tools.jsonl`
   - `candidate_conflicts.json`
   - `curation_decisions.json`
3. Approve only low-risk/high-confidence records first.
4. Re-run guarded apply:
   - `cd backend && npm run research:ingest:apply -- --release-id 2026-03-14-sprint4-candidate-002 --confirm APPLY_CANDIDATE_RELEASE`
5. Add a short backend note under `docs/planning/` summarizing:
   - approved slug count
   - conflicts resolved
   - apply result and evidence path

## 8. Test Requirements
1. Run required backend checks before commit:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
2. Re-run ingestion commands in this order:
   - `cd backend && npm run db:bootstrap`
   - `cd backend && npm run research:ingest:dry-run`
   - `cd backend && npm run research:ingest:apply -- --release-id 2026-03-14-sprint4-candidate-002 --confirm APPLY_CANDIDATE_RELEASE`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Candidate release `2026-03-14-sprint4-candidate-002` applies successfully with guardrails.
2. Backend apply evidence file exists in release-evidence folder.
3. Approved subset is conflict-clean and required-field compliant.
4. QA can re-run gate without backend governance blocker.

## 10. Deliverables
1. Updated staging artifacts (`curation_decisions.json`, conflict resolution outputs).
2. Successful controlled apply for `2026-03-14-sprint4-candidate-002`.
3. Backend apply summary evidence JSON in release-evidence path.
4. Short backend summary note under `docs/planning/`.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code/docs that claim success when apply or tests failed.
3. Report exact commands executed and whether each passed.
4. Escalate blockers with concrete artifact-level reasons.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend engineer owns first-pass curation decisions for this controlled candidate.
- Open questions:
  1. Which initial tool slugs are best for the first safe approved subset?
