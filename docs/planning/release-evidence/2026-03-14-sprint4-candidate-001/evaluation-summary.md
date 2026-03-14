# Evaluation Summary

Release ID: `2026-03-14-sprint4-candidate-001`  
Date: `2026-03-14`  
Owner: `QA Specialist`

## Candidate Context
1. Candidate artifacts from `backend/db/staging/research_ingest/`.
2. Baseline comparison execution is scaffolded; full scenario-evaluation command is not yet implemented.
3. This release run validates candidate-governance controls and evidence discipline for first controlled candidate execution.

## Command Results
1. `cd backend && npm run lint` -> `PASS`
2. `cd backend && npm run test` -> `PASS`
3. `cd backend && npm run test:integration` -> `PASS`
4. `cd backend && npm run research:ingest:dry-run` -> `PASS` (`sources=11`, `candidates=30`, `conflicts=90`, `approved=0`)
5. `cd backend && npm run research:ingest:apply -- --release-id 2026-03-14-sprint4-candidate-001 --confirm APPLY_CANDIDATE_RELEASE` -> `FAIL` (`No approved tools found in curation decisions`)
6. `cd backend && npm run db:bootstrap` -> `PASS`

## Gate Metrics (Current Candidate Snapshot)
1. `candidate_count`: `30`
2. `status=review_required`: `30`
3. `conflict_count`: `90`
4. `approved_decision_count`: `0`
5. `low_conf_required_count` (initial proxy from staged candidates): `11`
6. `contract_failure_count`: `N/A` (no candidate apply performed)

## Threshold / Governance Check
1. Explicit confirmation-token guard present -> `PASS`
2. Approved-decision requirement enforced -> `PASS`
3. Unresolved-conflict block behavior enforced -> `PASS`
4. Candidate eligible for controlled apply -> `FAIL` (no approved tools)
5. Candidate release decision -> `REJECT`

## Final Recommendation
1. `Reject`
2. Rationale:
   - No approved tools are available in curation decisions.
   - Candidate has unresolved conflict volume and is not eligible for apply.
   - Governance correctly blocked uncontrolled data mutation.
