# Release Evidence Bundle (QA Scaffold)

This folder contains reusable Sprint 3 QA gate templates for research-ingestion candidate releases.

Reference framework:
1. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
2. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`

## Expected evidence per candidate release
Create a subfolder:

`docs/planning/release-evidence/<release-id>/`

Required files:
1. `evaluation-summary.md`
2. `scenario-diff.json`
3. `review-decisions.json`
4. `gate-decision.md`

Template files are in:

`docs/planning/release-evidence/templates/`

## Minimum command evidence to include
1. `cd backend && npm run lint`
2. `cd backend && npm run test`
3. `cd backend && npm run test:integration`
4. `cd backend && npm run research:ingest:dry-run`
5. Candidate evaluation command when implemented (planned: `npm run recommendation:evaluate`)

## Hard gate reminders
1. `contract_failure_count` must be `0`.
2. `low_confidence_record_rate` must be `0%`.
3. Unresolved identity/category conflicts block release.
4. Missing provenance for changed required fields blocks release.
