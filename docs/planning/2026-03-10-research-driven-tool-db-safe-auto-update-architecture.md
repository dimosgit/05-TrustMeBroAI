# TrustMeBroAI: Research-Driven Tool Database + Safe Auto-Update Architecture

## Summary
- Keep PostgreSQL as the serving database, but move from manual seed data to a release-based ingestion system.
- Use `docs/research/**/*.md` as raw input and generate canonical JSONL as the only update source for DB writes.
- Use PR-gated automation in GitHub Actions for all updates.
- Add strict safety controls: no hard deletes, transactional release apply, audit logs, rollback pointer, and drift thresholds.
- Upgrade recommendation flow from static mock logic to hybrid retrieval: deterministic weighted scoring + semantic evidence matching.

## Implementation Changes

### 1. Introduce a release-based data model while keeping current app compatibility
- Keep existing `tools` table as the serving table used by APIs and `recommendations`.
- Add required columns to `tools`: `best_for`, `pricing`, `ease_of_use`, `speed`, `quality`, `target_users`, `tags`, `website`, `tool_slug`.
- Keep existing fields (`name`, `pricing_label`, `website_url`) during transition; populate both (`name`/`tool_name`, `website_url`/`website`, `pricing_label`/`pricing`) to avoid frontend breakage.
- Add `CHECK` constraints: `ease_of_use`, `speed`, `quality` must be `1..5`.
- Add `UNIQUE(tool_slug)` as canonical identity key for updates.
- Add soft lifecycle fields: `record_status` (`active|inactive|deprecated`), `superseded_by_tool_slug`, `last_seen_at`.
- Add `tool_versions` table storing full before/after row snapshots per release.
- Add `dataset_releases` table with `release_id`, `dataset_hash`, `status` (`candidate|active|failed|archived`), `approved_by`, `activated_at`.
- Add `tool_evidence` table with per-field provenance: `tool_slug`, `field_name`, `source_path`, `source_url`, `excerpt`, `source_type`, `confidence`.
- Add `release_audit_events` table capturing every apply/deactivate/rollback operation with actor and workflow run id.

### 2. Add safe DB update functions (no accidental destructive changes)
- Create `fn_apply_tool_release(release_id, expected_hash, actor, allow_deactivate default false)`:
  - acquires advisory lock;
  - validates release state and hash;
  - runs in one transaction (`SERIALIZABLE`);
  - upserts by `tool_slug`;
  - writes row diffs to `tool_versions` + `release_audit_events`;
  - blocks hard delete paths.
- Create `fn_mark_tools_missing_for_review(release_id)`:
  - flags tools absent in current release as `candidate_missing`;
  - does not deactivate automatically.
- Create `fn_soft_deactivate_tools(release_id, approved_slugs, actor)`:
  - only path allowed for deactivation;
  - enforces explicit list and audit trail.
- Create `fn_rollback_to_release(target_release_id, actor)`:
  - restores tools serving state from historical snapshots;
  - sets active release pointer back.
- Add trigger that rejects `DELETE FROM tools` unless a dedicated admin session variable is explicitly set (and still logged).

### 3. Build deterministic ingestion pipeline from research files
- Add Python pipeline (`pipelines/research_ingest`) with stages: `extract -> normalize -> validate -> diff -> export`.
- Support two parser strategies:
  - key-value block parser for lines like `Tool Name:`, `Category:`, `Best For:`.
  - markdown table parser for rows like `| **Tool Name** | ... |`.
- Normalize into canonical files:
  - `data/research/canonical/tools.jsonl`
  - `data/research/canonical/evidence.jsonl`
- Validation rules:
  - required fields present for each tool (`tool_name`, `category`, `best_for`, `pricing`, `ease_of_use`, `speed`, `quality`, `target_users`, `tags`, `website`);
  - URL validation and domain extraction;
  - ratings coercion to integer `1..5`;
  - duplicate resolution by `tool_slug`.
- Conflict policy:
  - when sources disagree, keep all evidence rows;
  - serving value chooses highest `confidence`, then newest `source_date`, then source priority.
- Add adapter interface for future sources (`gemini`, YouTube transcripts, other agents) that outputs the same canonical JSONL contract.

### 4. Add retrieval architecture for wizard + real question answering
- Replace current `pickMockRecommendation` path (DB mode) with ranking engine driven by `tools` + evidence.
- Keep response shape stable for frontend: `primary_tool`, `alternative_tools`, `explanation`.
- Add hybrid retrieval:
  - structured ranking from `tools` fields and priority weights;
  - semantic evidence boost from `tool_evidence` embeddings (`pgvector`).
- Add `tool_evidence_embeddings` table and index (`ivfflat`/`hnsw`) for similarity retrieval.
- Introduce a new endpoint for real user questions:
  - `POST /api/recommendation/query`
  - input: `question`, optional `profile`, `task`, `priorities`
  - output: ranked tools + explanation + citation snippets from `tool_evidence`.
- Priority weight defaults:
  - `Best quality`: quality-heavy profile.
  - `Fastest results`: speed-heavy profile.
  - `Easiest to use`: ease-heavy profile.
  - `Lowest price`: pricing-heavy profile.
  - `Privacy` and `Beginner friendly`: tag and target-user boosts.
- Fallback behavior:
  - if semantic index unavailable, use structured-only ranking;
  - if active release invalid, use previous active release pointer;
  - if DB unavailable, keep existing mock mode as last resort.

## GitHub Automation Plan (PR-Gated)

### 1. `research-parse-validate.yml` (PR on `docs/research/**` or adapter outputs)
- Runs parser/validator.
- Regenerates canonical JSONL and change report.
- Fails PR on schema/validation errors or dangerous drift thresholds.
- Publishes human-readable diff artifact (`added/updated/flagged/deactivation-candidates`).

### 2. `research-enrichment-agents.yml` (manual + optional schedule)
- Runs optional adapters:
  - Gemini deep research/web search adapter.
  - YouTube transcript ingestion adapter from a source manifest.
  - external agent adapters using the same contract.
- Opens PR with generated research and canonical updates; never applies DB changes directly.

### 3. `db-release-apply.yml` (push to `main` when canonical changes, plus manual dispatch)
- Runs migration checks and dry-run diff.
- Creates release candidate in DB.
- Applies via `fn_apply_tool_release`.
- Runs post-apply assertions and health checks.
- On failure, marks release failed and keeps previous active release.

### 4. `db-backup-and-verify.yml` (nightly)
- Creates DB backup.
- Verifies restore on ephemeral DB.
- Stores backup metadata and verification result.

## Public APIs / Interfaces / Types
- Existing `GET /api/tools` remains, with added fields: `best_for`, `pricing`, `ease_of_use`, `speed`, `quality`, `target_users`, `tags`, `website`, `tool_slug`, `record_status`.
- Existing `POST /api/recommendation` remains contract-compatible; ranking logic changes from static rules to DB scoring.
- New `POST /api/recommendation/query` for free-text real questions with evidence-backed output.
- Canonical ingestion interface:
  - `tools.jsonl` record schema (one record per tool version).
  - `evidence.jsonl` record schema (one record per evidence statement).
- Adapter contract for future agents/transcript ingestors must emit canonical JSONL only.

## Test Plan

### 1. Data-model and function tests
- Migration tests for new columns/constraints/indexes.
- Function tests for `apply`, `soft_deactivate`, `rollback`.
- Idempotency test: applying same release twice makes no unintended changes.
- Hard-delete prevention test.

### 2. Ingestion tests
- Parser fixtures for both current markdown styles in your repo.
- Validation failure cases: invalid URL, out-of-range score, missing required fields.
- Conflict resolution tests with competing source values.
- Drift threshold tests (mass unintended changes should fail CI).

### 3. Retrieval tests
- Ranking determinism tests per priority profile.
- Semantic evidence boost tests with expected top matches.
- API response contract tests to ensure frontend still renders.

### 4. Workflow tests
- PR pipeline produces canonical artifacts and diff summary.
- Main-branch pipeline applies approved release only.
- Backup workflow restore verification passes.

## Assumptions and Defaults Locked
- Update path: PR-gated sync.
- Canonical format: JSONL.
- Recommendation v1: deterministic weighted scoring.
- Delete policy: soft-delete only.
- Retrieval mode: hybrid structured + semantic evidence.
- DB engine remains PostgreSQL, with `pgvector` extension enabled for semantic retrieval.
