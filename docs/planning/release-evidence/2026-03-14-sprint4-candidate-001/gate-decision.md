# Gate Decision

Release ID: `2026-03-14-sprint4-candidate-001`  
Decision: `Reject`

## Why
1. Candidate apply was blocked by governance guardrail:
   - `No approved tools found in curation decisions`.
2. Candidate conflict set remains unresolved (`conflicts=90`).
3. Candidate is not eligible for controlled DB apply yet.

## Required Next Steps
1. Curate and approve a bounded initial subset in `curation_decisions.json`.
2. Resolve conflicts for any approved tool slug.
3. Re-run:
   - `npm run research:ingest:dry-run`
   - `npm run research:ingest:apply -- --release-id <new-id> --confirm APPLY_CANDIDATE_RELEASE`
4. Produce refreshed release-evidence bundle for the new candidate id.
