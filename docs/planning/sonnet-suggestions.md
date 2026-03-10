# TrustMeBroAI: Architecture Analysis & Implementation Recommendations

**Date:** 2026-03-10  
**Reviewer:** GitHub Copilot (Claude Sonnet 4.6)  
**References:** `docs/planning/2026-03-10-research-driven-tool-db-safe-auto-update-architecture.md`, full codebase review

---

## Executive Summary

The plan is well-structured and architecturally sound at the macro level. Its core instincts — release gating, soft deletes, canonical JSONL as the single write source, and hybrid retrieval — are the right ones. However, several implementation gaps, sequencing risks, and underspecified details could cause significant rework if not addressed before execution begins. This document surfaces those gaps with concrete recommendations.

**Verdict by section:**

| Section                     | Assessment                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Data model additions        | ✅ Well-specified — minor gaps noted                                                  |
| Safe DB update functions    | ✅ Solid approach — edge cases need definition                                        |
| Ingestion pipeline (Python) | ⚠️ Underspecified — runtime, environment, and output contract need definition         |
| Retrieval architecture      | ⚠️ Premature pgvector dependency — defer until structured ranking proves insufficient |
| GitHub Actions workflows    | ⚠️ Staging DB strategy not defined — blocks CI/CD design                              |
| API layer                   | ⚠️ New `/query` endpoint needs rate limiting + input validation                       |
| Test plan                   | ⚠️ Missing migration path for existing 9-tool seed data                               |
| Frontend compatibility      | ✅ Backward-compatible — one hidden risk noted                                        |

---

## 1. Data Model

### What the plan gets right

- `UNIQUE(tool_slug)` as identity key is the correct anchor for upsert-based updates.
- `record_status` with `active|inactive|deprecated` covers all evolution states cleanly.
- `tool_versions` for before/after snapshots is the right audit strategy — much simpler than a full CDC solution for this scale.
- `dataset_releases` with a `status` state machine is a good pattern.

### Gaps and recommendations

#### 1.1 `tool_slug` derivation is not defined

The plan uses `tool_slug` as the canonical identity key everywhere but never specifies how it is derived — neither at seed time nor at ingest time. A mismatch between `"github-copilot"` (ingest output) and `"github_copilot"` (existing seed) will create duplicates instead of upserts.

**Recommendation:** Define the slug rule explicitly: lowercase, alphanumeric and hyphens only, no consecutive hyphens, max 64 chars. Example: `"GitHub Copilot" → "github-copilot"`, `"GPT-4o" → "gpt-4o"`. Implement it as a single shared utility (Python function + SQL expression) called by both the ingest pipeline and DB migration backfill.

#### 1.2 Existing 9 tools need a migration path

The current `tools` table has 9 rows with IDs 1–9, no `tool_slug`, and old field names (`pricing_label`, `website_url`). These are referenced by `recommendations.primary_tool_id` and `user_sessions`. The plan adds new columns but does not specify:

- How existing rows get a `tool_slug` backfilled.
- Whether `pricing_label` and `website_url` stay permanently or have a deprecation deadline.
- What happens to existing `recommendations` rows pointing to the old tool IDs when a release upserts the same tool.

**Recommendation:** Add an explicit **Data Migration Phase** as the first step:

1. Backfill `tool_slug` for all 9 existing tools via a migration script.
2. Backfill `record_status = 'active'` for all 9 existing tools.
3. Keep both `pricing_label`/`website_url` and `pricing`/`website` columns permanently (not just "during transition") with a DB-level `GENERATED ALWAYS AS` expression keeping them in sync, or add a view.

#### 1.3 `tool_versions` snapshot strategy at rollback time

`fn_rollback_to_release` is specified to "restore tools serving state from historical snapshots." But if a tool went through releases `v1 → v2 → v3` and you roll back from `v3` to `v1`, the snapshot in `tool_versions` for `v1` must be the "after" state of `v1` (i.e., the serving state after `v1` was applied). Confirm the snapshot captures the post-apply row, not the pre-apply row, to make rollback correct.

**Recommendation:** Clarify in the function spec: `tool_versions.after_snapshot` is the canonical restore point. Rollback applies `after_snapshot` from the target release for every tool that existed in that release; tools that did not exist in the target release are set to `record_status = 'inactive'` (not deleted).

#### 1.4 `candidate_missing` is an undocumented status

`fn_mark_tools_missing_for_review` sets `record_status = 'candidate_missing'` but the original `record_status` definition only lists `active|inactive|deprecated`. This is a fourth value.

**Recommendation:** Add `candidate_missing` to the `CHECK` constraint definition, or use a separate boolean column `missing_in_latest_release` to avoid polluting the serving status field with a transient candidate state.

#### 1.5 `release_audit_events.actor` — define actor format

The actor column is referenced throughout but never typed. In CI it will be a GitHub Actions workflow run ID; in manual ops it will be a human username. Define the format now to avoid inconsistent data that breaks audit queries later.

**Recommendation:** `actor VARCHAR(255)` in the format `"ci:github-actions:<run_id>"` or `"human:<github_username>"`. Add this to the table DDL spec.

---

## 2. Safe DB Update Functions

### What the plan gets right

- Advisory lock before apply is the correct concurrency control for a single-writer release model.
- `SERIALIZABLE` isolation level is appropriate here.
- Blocking `DELETE FROM tools` at the trigger level is a strong safety net.

### Gaps and recommendations

#### 2.1 Advisory lock scope

PostgreSQL session-level advisory locks (`pg_try_advisory_lock`) vs. transaction-level locks (`pg_try_advisory_xact_lock`) behave very differently. Session-level locks persist after the transaction commits and must be explicitly released — if the function errors and the connection is reused (pooled), the lock stays held. Transaction-level locks auto-release at commit/rollback.

**Recommendation:** Use `pg_try_advisory_xact_lock(hashtext('fn_apply_tool_release'))` (transaction-level) inside the function so the lock is always released on function exit.

#### 2.2 `expected_hash` validation — define the hash input

The function signature includes `expected_hash` to validate release integrity, but the plan does not specify what is hashed. Is it the SHA-256 of the raw JSONL file? The sorted canonical JSON of all tool records? The hash must be computed identically by the Python pipeline and the DB function.

**Recommendation:** Define the hash as `SHA-256(sorted_canonical_json_of_tools_array)` where the canonical JSON is produced by a shared serializer. Store the hash in `dataset_releases.dataset_hash` at candidate-creation time and verify it at apply time. Document the exact serialization (field order, Unicode normalization).

#### 2.3 Drift threshold check is mentioned but never quantified

The plan says the PR pipeline "fails on dangerous drift thresholds" but no threshold is defined. Without a concrete number, the CI check cannot be implemented.

**Recommendation:** Define drift thresholds explicitly, for example:

- Block if > 20% of currently active tools are flagged as `candidate_missing` in a single release.
- Block if a single release would downgrade a rating field (`ease_of_use`, `speed`, `quality`) by more than 2 points for any tool.
- Warn (not block) if a release adds > 50 new tools at once.

These numbers should be configurable via the CI workflow inputs, not hardcoded.

#### 2.4 `fn_soft_deactivate_tools` — who provides `approved_slugs`?

The function takes an explicit list of `approved_slugs`. The plan does not define where this list comes from in the automated flow. Is it:
a) A human-curated list added to the PR before merge?
b) Auto-extracted from the JSONL diff artifact?
c) A separate GitHub Issues approval workflow?

**Recommendation:** Option (a) is the safest. Add a `deactivation-approvals.json` file to the repo that humans update in the PR; the `db-release-apply.yml` workflow reads this file and passes it as the `approved_slugs` argument. This keeps the audit trail in Git.

---

## 3. Ingestion Pipeline

This section has the largest specification gaps.

### What the plan gets right

- Two parser strategies (key-value block + markdown table) are the correct choices for the existing research files — the automation research file uses a markdown table format, while some others use prose with key-value blocks.
- Conflict resolution policy (keep all evidence, serving value chooses highest confidence) is the right default.
- Adapter interface pattern for future sources is forward-thinking.

### Gaps and recommendations

#### 3.1 Python pipeline runtime environment is not defined

Where does this pipeline actually run? Options:

- **GitHub Actions job** (ephemeral): Simple, no maintenance, cold-start latency acceptable for CI.
- **Docker service added to docker-compose**: Always-on, can be triggered on demand.
- **Standalone script run locally**: Developer-run before committing.

The plan references `pipelines/research_ingest` and GitHub Actions workflows, implying a GitHub Actions job, but it is never confirmed. This decision affects the Python environment, dependency management (requirements.txt vs. pyproject.toml), and secrets handling.

**Recommendation:** Run as a **GitHub Actions job** using a standard Python 3.12 container. Keep `pipelines/research_ingest` as a standalone Python package with its own `pyproject.toml` (no implicit dependency on Node.js). This is the simplest path.

#### 3.2 The research files are already in clean markdown table format for most categories

Looking at the actual research files (`AI Automation Tool Research For Database.md`, `AI Developer Tools Research.md`), the automation file already has a structured table with columns: `Tool Name | Category | Primary Use Case | Best For | Strengths | Weaknesses | Pricing Model | Ease of Use (1–5) | Quality (1–5) | Speed (1–5) | Typical Users | Website | Short Description`. This is almost a direct ingest — do not over-engineer the parser.

**Recommendation:** The **markdown table parser should be the primary strategy**, not a secondary one. The key-value block parser should be the fallback for prose-heavy files. The table parser can handle 80%+ of the existing research files with minimal logic.

#### 3.3 Rating coercion edge cases

The research files use patterns like `"4–5"`, `"4/5"`, `"4.5"`, and `"4 (approximate)"` in rating cells. The validator must handle all of these, not just plain integers.

**Recommendation:** Coercion rule: extract the first integer found in the string. If a range (`4–5`), take the lower bound. If no integer found, set to `null` and flag as `unresolvable`. Never silently default to a value like 3.

#### 3.4 `evidence.jsonl` schema is not defined

The plan lists `evidence.jsonl` as a canonical output but never defines its record schema. It must be defined before the pipeline can be implemented, because the `tool_evidence` table's columns must match it.

**Recommendation:** Define the minimum evidence record schema:

```json
{
  "tool_slug": "zapier",
  "field_name": "ease_of_use",
  "source_path": "docs/research/AI Automation Tool Research For Database.md",
  "source_url": null,
  "excerpt": "Ease of Use: 5",
  "source_type": "research_md",
  "confidence": 0.9,
  "source_date": "2026-03"
}
```

`confidence` should be a float between 0 and 1. For table-parsed values from the primary research files, default to `0.9`. For prose-extracted values, default to `0.6`. For Gemini-enriched values, `0.7`. These defaults should be documented.

#### 3.5 `conversations_metadata_dataset.csv` and `feedback_dataset.csv` are ignored

These two files in `docs/research/` contain what appears to be user feedback and conversation data. The plan does not reference them at all. This is likely a goldmine for improving recommendation quality — feedback data could inform confidence weighting or surface which tools users find helpful vs. disappointing.

**Recommendation:** At minimum, read these files and determine if they contain tool-level feedback. If they do, design an adapter for them in the ingestion pipeline and feed their signal into the `confidence` field of `tool_evidence` rows.

---

## 4. Retrieval Architecture

### What the plan gets right

- Keeping the existing `/api/recommendation` contract-compatible is critical — the frontend depends on `{primary_tool, alternative_tools[], explanation}`.
- Priority weight profiles (quality-heavy, speed-heavy, etc.) map well to the existing user flow.
- Fallback chain (semantic → structured-only → mock) is the right resilience model.

### Gaps and recommendations

#### 4.1 pgvector is premature in Phase 1

The plan introduces `tool_evidence_embeddings`, an `ivfflat`/`hnsw` index, an embedding model, and a hybrid scoring system as part of the initial implementation. This adds:

- A dependency on an external embedding API (OpenAI, Gemini, or local model).
- Embedding generation at ingest time (pipeline complexity).
- pgvector extension in PostgreSQL (requires Docker image change or manual install).
- A significantly more complex scoring query.

The current use case — structured questions with known profile/task/priority combinations — does not require semantic matching at all. The existing research data already has structured `best_for` text fields and explicit numeric ratings that are sufficient for deterministic weighted scoring.

**Recommendation:** Defer pgvector and semantic retrieval to a **Phase 2** milestone. Implement Phase 1 using purely structured scoring from `tools` fields. Define a concrete trigger for enabling Phase 2 (e.g., "when free-text `/query` endpoint is launched" or "when tool catalog exceeds 200 entries"). This reduces the initial implementation surface by ~40%.

#### 4.2 `POST /api/recommendation/query` needs rate limiting and input sanitization

This is a net-new endpoint that accepts free-text user input and executes a DB query (or embedding lookup) on every call. This is a significant security and cost surface that the plan does not address.

**Recommendation:**

- Add per-IP rate limiting (e.g., `express-rate-limit`: 10 requests/minute per IP).
- Sanitize `question` input: max 500 characters, strip control characters.
- Do not pass user-supplied text directly into SQL queries; use parameterized queries throughout.
- Add a `POST /api/recommendation/query` request log to `release_audit_events` or a separate `query_events` table (at minimum: timestamp, hashed IP, question length, result count). This satisfies monitoring requirements without logging user PII.

#### 4.3 Priority weight defaults are not versioned

The plan lists priority weight defaults inline. When these change (and they will), there is no mechanism to reproduce historical recommendation outputs.

**Recommendation:** Store priority weight profiles as a `recommendation_profiles` table in the database, versioned with `created_at` and `is_active`. Each recommendation row in the `recommendations` table should store a `profile_version_id` foreign key so any past recommendation can be reproduced.

---

## 5. GitHub Actions Workflows

### What the plan gets right

- PR-gated release apply (never apply to DB directly from a feature branch) is the right constraint.
- Nightly backup + restore verification is a strong reliability requirement.

### Gaps and recommendations

#### 5.1 `db-release-apply.yml` — what database does it run against?

The plan does not specify whether CI applies releases to:

- A **staging/ephemeral DB** spun up in the GitHub Actions job (e.g., `services: postgres` in the workflow YAML), or
- A **persistent staging environment**, or
- **Directly to production** after merge.

Applying directly to production on every merge to `main` is dangerous without a staging gate.

**Recommendation:** Add a two-stage model:

1. On merge to `main`: apply to a **staging DB** (GitHub Actions service container). Run post-apply assertions there.
2. Manual `workflow_dispatch` with `environment: production` protection: apply to the live production DB. This requires a GitHub Environment with required reviewers configured.

#### 5.2 `research-enrichment-agents.yml` — secrets management

This workflow calls external APIs (Gemini, YouTube). The plan does not specify how API keys are stored or rotated.

**Recommendation:** Store API keys as **GitHub Actions secrets** (not repository variables). Document which secrets are required in `docs/planning/` or the repo README so new contributors can configure them. Rotate keys every 90 days.

#### 5.3 The `db-backup-and-verify.yml` workflow — retention policy not defined

Without a retention policy, backup storage grows unbounded.

**Recommendation:** Retain daily backups for 7 days, weekly for 4 weeks, monthly for 12 months. Use a GitHub Actions step or cloud storage lifecycle rule to enforce this. Document the policy in the workflow YAML as a comment.

---

## 6. API Layer

#### 6.1 `GET /api/tools` will return 100+ tools after ingestion

Currently this endpoint returns 9 tools. After a full ingest from all research files (which contain 15–20 tools per file × ~10 files = 150–200 tools), an unpaginated response will be large and the frontend — which currently renders all tools — will break or become unusable.

**Recommendation:**

- Add optional `?category=` and `?status=` query parameters to allow filtered fetching.
- Add `?limit=` and `?offset=` for pagination.
- The frontend does not call `GET /api/tools` to render results (it uses the recommendation endpoint), so this is not breaking — but document that `GET /api/tools` is now a catalog browsing endpoint, not a "fetch all active tools" contract.

#### 6.2 Frontend `explanation` field will grow significantly

The recommendation API returns an `explanation` string. Currently this is a short hardcoded sentence. With evidence-backed explanations and citation snippets, this will grow to a structured object. The frontend currently renders it as plain text.

**Recommendation:** Keep `explanation` as a string in Phase 1 (backward-compatible). In Phase 2, add a parallel `explanation_structured` field with citations — this avoids breaking the frontend while enabling richer rendering when the frontend is updated.

---

## 7. Implementation Sequencing — Recommended Phase Plan

The original plan presents features in a logical grouping but does not define a clear, testable delivery sequence with explicit go/no-go checkpoints. The following phase plan reduces risk by ensuring each phase is independently deployable:

### Phase 0: Foundation (prerequisite for everything)

1. Write and run the `tool_slug` backfill migration for existing 9 tools.
2. Add all new columns to `tools` with backward-compatible defaults.
3. Create `dataset_releases`, `tool_versions`, `release_audit_events` tables.
4. Add the hard-delete prevention trigger.
5. **Verify:** All existing API endpoints still pass existing tests. No frontend regression.

### Phase 1: Ingest pipeline + structured data

1. Build the Python ingestion pipeline (`extract → normalize → validate → diff → export`).
2. Ingest all existing `docs/research/**` files into `data/research/canonical/tools.jsonl`.
3. Implement `fn_apply_tool_release` (without embedding steps).
4. Implement `research-parse-validate.yml` CI workflow.
5. Apply the first real release to staging DB.
6. **Verify:** Tool catalog grows from 9 to 100+ with correct data, duplicate slugs resolved, all ratings in 1–5 range, `tool_slug` unique constraint holds.

### Phase 2: Improved recommendation engine

1. Implement weighted scoring engine in `recommendation.js` using the new `tools` fields.
2. Add priority weight profiles table.
3. Keep existing `/api/recommendation` endpoint contract.
4. **Verify:** Recommendation output changes are deterministic and documented. Existing frontend renders correctly.

### Phase 3: Automation + rollback

1. Implement `fn_soft_deactivate_tools`, `fn_rollback_to_release`.
2. Implement `db-release-apply.yml` full workflow with staging gate.
3. Implement `db-backup-and-verify.yml`.

### Phase 4: Semantic retrieval (future milestone)

1. Add pgvector, embeddings generation, `tool_evidence_embeddings` table.
2. Implement `POST /api/recommendation/query` endpoint.
3. Ship `research-enrichment-agents.yml`.

---

## 8. Security Checklist

Items in the plan or current code that require attention:

| Issue                                                                        | Location               | Severity       | Recommendation                                                                                         |
| ---------------------------------------------------------------------------- | ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| No rate limiting on any endpoint                                             | `backend/src/index.js` | Medium         | Add `express-rate-limit` at minimum on `/api/recommendation` and future `/query`                       |
| No input validation on `POST /api/session` body                              | `backend/src/index.js` | Medium         | Validate `profile_id`, `task_id` are positive integers; validate `priorities` is an array of known IDs |
| No input validation on `POST /api/recommendation` body                       | `backend/src/index.js` | Medium         | Validate `session_id` is a positive integer                                                            |
| Free-text user input in planned `/query` endpoint                            | Planned                | High           | Parameterized queries only; max length 500; rate limit 10/min/IP                                       |
| DB credentials in `docker-compose.yml` are default (`trustmebro:trustmebro`) | `docker-compose.yml`   | Low (dev only) | Ensure `docker-compose.prod.yml` overrides these with secrets or env injection                         |
| GitHub Actions secrets for Gemini/YouTube API keys                           | Planned                | Medium         | Document required secrets; rotate on 90-day schedule                                                   |

---

## 9. Minor Technical Observations

- **`postgres:18-alpine`** in `docker-compose.yml`: PostgreSQL 18 is not yet released as a stable version (as of March 2026). Verify this is intentional or change to `postgres:17-alpine` to stay on a stable release.
- The plan mentions `ivfflat` and `hnsw` indexes for pgvector. `hnsw` is the better default for most workloads at this scale — prefer it when Phase 4 is implemented.
- The `local-setup.mjs` and `local-start.mjs` scripts should be updated (or documented) to include running the Python ingest pipeline locally, so developers can build the tool catalog without CI.
- The `output/playwright/` directory suggests test infrastructure exists or is planned — ensure the Playwright tests are updated to account for the new tool catalog size in results pages.

---

## Summary of Key Decisions Needed Before Implementation

1. **`tool_slug` format rule** — Define the exact derivation algorithm.
2. **Migration plan for existing 9 tools** — Backfill strategy for `tool_slug` and new columns.
3. **Drift threshold values** — Quantify the CI blocking thresholds.
4. **`deactivation-approvals.json` process** — How are approved deactivations submitted?
5. **Staging DB strategy** — Ephemeral CI container vs. persistent staging environment.
6. **pgvector timing** — Confirm deferral to Phase 4.
7. **`feedback_dataset.csv` and `conversations_metadata_dataset.csv`** — Investigate for recommendation signal before designing the evidence confidence scheme.
