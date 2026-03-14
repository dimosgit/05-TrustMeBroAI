# Evaluation Summary

Release ID: `2026-03-14-sprint4-candidate-002`  
Date: `2026-03-14`  
Owner: `QA Specialist`

## Candidate Context
1. Candidate artifacts loaded from `backend/db/staging/research_ingest/`.
2. Controlled apply executed with explicit confirmation token.
3. This run validates first successful guarded apply for a bounded approved subset.

## Command Results
1. `cd backend && npm run lint` -> `PASS`
2. `cd backend && npm run typecheck` -> `PASS`
3. `cd backend && npm run test` -> `PASS`
4. `cd backend && npm run test:integration` -> `PASS`
5. `cd backend && npm run db:bootstrap` -> `PASS`
6. `cd backend && npm run research:ingest:dry-run` -> `PASS` (`sources=11`, `candidates=30`, `conflicts=87`, `approved=3`)
7. `cd backend && npm run research:ingest:apply -- --release-id 2026-03-14-sprint4-candidate-002 --confirm APPLY_CANDIDATE_RELEASE` -> `PASS` (`applied_tools=3`)

## Gate Metrics Snapshot
1. `candidate_count`: `30`
2. `approved_count`: `3`
3. `applied_tool_count`: `3`
4. `conflict_count` (total candidate set): `87`
5. `contract_failure_count`: `0` (no apply-time contract failures)
6. `low_confidence_record_rate`: `N/A` (full evaluator command not yet implemented)

## Governance Check
1. Confirmation token required -> `PASS`
2. Approved-decision requirement -> `PASS`
3. Conflict gate for approved slugs -> `PASS`
4. Transactional apply path -> `PASS`
5. Backend apply evidence output -> `PASS`

## Final Recommendation
1. `Approve with exceptions`
2. Rationale:
   - Controlled apply succeeded for bounded approved subset.
   - Scenario-level benchmark diff automation is still scaffold-level and must be completed for stricter future release cycles.
