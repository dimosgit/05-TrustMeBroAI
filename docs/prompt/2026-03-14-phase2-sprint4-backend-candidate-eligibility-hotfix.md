## 1. Feature Title
`Phase 2 Sprint 4 Back-End Specialist: Candidate Eligibility Hotfix (approved=0 blocker)`

## 2. Objective
Fix the controlled candidate-release eligibility blocker so guarded apply can run successfully for release `2026-03-14-sprint4-candidate-002`.

## 3. Context
- Current QA result: all backend tests pass, but candidate apply fails with `No approved tools found in curation decisions`.
- Observed behavior: running `research:ingest:dry-run` produces `approved=0` and `conflicts=90`, then apply is blocked.

## 4. Scope
- In scope:
  1. Ensure a curated approved subset exists after dry-run.
  2. Ensure approved slugs are conflict-clean for apply.
  3. Make guarded apply succeed and write evidence.
- Out of scope:
  1. Editing `docs/planning/final-implementation-plan.md`.
  2. Retrieval/vector redesign.

## 5. Requirements
1. Root-cause fix: dry-run must not leave candidate workflow at `approved=0` for curated runs.
2. Approved subset must be explicit and auditable (`curation_decisions` by slug).
3. Approved slugs must not appear as unresolved conflicts at apply time.
4. Run successful apply with:
   - `--release-id 2026-03-14-sprint4-candidate-002`
   - `--confirm APPLY_CANDIDATE_RELEASE`
5. Ensure evidence file exists:
   - `docs/planning/release-evidence/2026-03-14-sprint4-candidate-002/backend-apply-summary.json`

## 6. Technical Constraints
1. Keep apply guardrails intact (confirm token, approved-only, conflict checks).
2. Keep changes deterministic and test-backed.
3. Do not weaken governance checks to force success.

## 7. Implementation Notes
1. Recommended durable path:
   - preserve/merge curator decisions by `tool_slug` across dry-run regenerations, or
   - introduce release-specific frozen candidate artifacts that are curated then applied.
2. Quick unblock is acceptable only if still auditable and reproducible for QA rerun.
3. Add/update tests covering:
   - decision preservation or release-artifact freezing
   - approved subset > 0 path
   - approved slug conflict enforcement

## 8. Test Requirements
1. Run:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
2. Candidate workflow:
   - `cd backend && npm run db:bootstrap`
   - `cd backend && npm run research:ingest:dry-run`
   - verify `approved_count > 0`
   - `cd backend && npm run research:ingest:apply -- --release-id 2026-03-14-sprint4-candidate-002 --confirm APPLY_CANDIDATE_RELEASE`
3. Do not commit if any check fails.

## 9. Acceptance Criteria
1. Guarded apply succeeds for `2026-03-14-sprint4-candidate-002`.
2. Evidence file is generated in the release-evidence folder.
3. QA can rerun and no longer hit `approved=0` blocker.

## 10. Deliverables
1. Backend code/artifact workflow update for candidate eligibility.
2. Updated tests.
3. Short backend note with exact commands + outputs + evidence path.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.
