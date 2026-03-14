# Phase 2 Sprint 3 Backend Note (2026-03-14)

## 1. Follow-the-Build Capture Contract

### Endpoint
`POST /api/follow-the-build/capture`

### Request body
1. `email` (required, valid email format)
2. `email_consent` (required, must be `true`)

### Behavior
1. Upserts the user with consent timestamp and follow-the-build attribution path.
2. Preserves an existing non-empty `signup_source` instead of overwriting it.
3. Captures funnel event `follow_the_build_captured`.
3. Returns explicit deterministic response payload:
   - status `201` when a new user is created
   - status `200` when the email already exists
   - body:
     - `captured`
     - `created`
     - `user_id`
     - `email`
     - `signup_source`

### Validation outcomes
1. Invalid email -> `400`
2. `email_consent !== true` -> `400`

## 2. Research Ingestion Dry-Run Command

### Command
`cd backend && npm run research:ingest:dry-run`

### Scope
1. Source discovery from `docs/research/*.md`
2. Markdown parsing and normalization into candidate tool records
3. Provenance/evidence extraction
4. Conflict detection
5. Curation decision scaffold generation
6. Deterministic SQL artifact generation (dry-run output only)

## 3. Staging Artifact Outputs

Generated under:
`backend/db/staging/research_ingest/`

1. `candidate_tools.jsonl`
2. `candidate_evidence.jsonl`
3. `candidate_conflicts.json`
4. `curation_decisions.json`
5. `approved_tool_updates.sql`

## 4. Non-Regression Guardrails

1. Recommendation scoring/runtime contract remains unchanged.
2. Raw `docs/research` is still not read at runtime API paths.
3. Ingestion path is dry-run artifact generation only in this sprint slice.
