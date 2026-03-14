# Phase 2 Sprint 4 Backend Note (2026-03-14)

## 1. Candidate Release Commands

1. Dry-run artifact generation:
   - `cd backend && npm run research:ingest:dry-run`
2. Guarded apply command:
   - `cd backend && npm run research:ingest:apply -- --release-id <release-id> --confirm APPLY_CANDIDATE_RELEASE`

## 2. Apply Guardrails

1. Apply requires explicit confirmation token (`APPLY_CANDIDATE_RELEASE`).
2. Apply requires explicit `release-id`.
3. Apply reads only staged artifacts from `backend/db/staging/research_ingest/`:
   - `candidate_tools.jsonl`
   - `candidate_conflicts.json`
   - `curation_decisions.json`
4. Apply is permitted only for tools with explicit approved decisions (`approve`/`approved`).
5. Apply rejects any approved tool slug that still appears in unresolved conflicts.
6. Apply validates required runtime fields before DB write.
7. Apply writes backend-owned traceability output to:
   - `docs/planning/release-evidence/<release-id>/backend-apply-summary.json`

## 3. Transaction Safety and Abort/Rollback Assumptions

1. Candidate apply executes in one DB transaction.
2. On first write failure, transaction is rolled back.
3. No partial tool updates are committed when rollback occurs.
4. This sprint slice relies on transactional rollback as the primary safety boundary; separate rollback command is not required for first controlled candidate release.

## 4. Runtime Stability

1. Runtime recommendation scoring semantics are unchanged.
2. No runtime API path reads raw `docs/research`.
3. Only approved staged candidate data can influence `tools` updates via guarded apply command.
