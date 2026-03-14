# Evaluation Summary Template

Release ID: `<release-id>`  
Date: `<YYYY-MM-DD>`  
Owner: `<name>`

## Candidate Context
1. Candidate artifact source:
2. Baseline artifact source:
3. Scope of data changes:

## Command Results
1. `cd backend && npm run lint` -> `PASS/FAIL`
2. `cd backend && npm run test` -> `PASS/FAIL`
3. `cd backend && npm run test:integration` -> `PASS/FAIL`
4. `cd backend && npm run research:ingest:dry-run` -> `PASS/FAIL`
5. `cd backend && npm run recommendation:evaluate` -> `PASS/FAIL` (when implemented)

## Gate Metrics
1. `contract_failure_count`:
2. `low_confidence_record_rate`:
3. `manual_override_rate`:
4. `primary_change_rate`:
5. `fallback_usage_rate` delta:
6. `tie_break_rate`:

## Threshold Check
1. `contract_failure_count == 0` -> `PASS/FAIL`
2. `low_confidence_record_rate == 0%` -> `PASS/FAIL`
3. `manual_override_rate <= 20%` -> `PASS/FAIL`
4. `primary_change_rate <= 25%` (unless major refresh) -> `PASS/FAIL`
5. `fallback_usage_rate` delta <= 10 percentage points -> `PASS/FAIL`

## Scenario Notes
1. Changed-primary count:
2. Contract violations:
3. Critical mismatches:

## Reviewer Summary
1. Curator:
2. Product reviewer:
3. QA reviewer:

## Final Recommendation
1. `Approve` / `Approve with exceptions` / `Reject`
2. Rationale:
