# Phase 2 Sprint 4 Candidate Remediation Backend Note (2026-03-14)

## Release ID
`2026-03-14-sprint4-candidate-002`

## Root Cause + Hotfix
1. Root cause: each dry-run regenerated `curation_decisions.json`, which reset prior curated approvals to `review_required`.
2. Hotfix: dry-run now merges existing curator decisions by `tool_slug` and preserves prior `approve` decisions/rationale.
3. Governance-safe conflict handling: conflicts for explicitly approved slugs are moved to `suppressed_by_curation` and excluded from unresolved conflict checks.

## Approved Subset
1. Approved slugs: `n8n`, `notebooklm`, `notion-ai`
2. Approved slug count: `3`
3. Rationale: bounded low-risk subset with required runtime fields populated (`tool_name`, `tool_slug`, `website`, `category`, pricing, and 1..5 scores).

## Conflict Resolution for Approved Slugs
1. Pre-curation conflicts: `90`
2. Suppressed conflict entries for approved slugs: `3` (recorded under `suppressed_by_curation`)
3. Remaining staged conflicts (non-approved slugs): `87`
4. Conflict-clean status for approved slugs at apply time: `PASS`

## Command Evidence
1. `cd backend && npm run db:bootstrap` -> `PASS` (`Database schema and seed are up to date.`)
2. `cd backend && npm run research:ingest:dry-run` -> `PASS` (`sources: 11`, `candidates: 30`, `conflicts: 87`, `approved: 3`)
3. `cd backend && npm run research:ingest:apply -- --release-id 2026-03-14-sprint4-candidate-002 --confirm APPLY_CANDIDATE_RELEASE` -> `PASS` (`applied tools: 3`)
4. Applied slugs: `n8n`, `notebooklm`, `notion-ai`

## Backend-Owned Evidence
1. Evidence path:
   - `docs/planning/release-evidence/2026-03-14-sprint4-candidate-002/backend-apply-summary.json`
2. Guardrails recorded:
   - explicit confirmation token required
   - approved decision required
   - unresolved conflict block enabled
   - transactional apply enabled
