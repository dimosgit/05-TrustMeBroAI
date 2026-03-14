# Recommendation Data Architecture (Phase 2)

Date: 2026-03-14  
Owner: Recommendation Data Architect  
Status: Proposed for approval

## 1. Purpose
Define a safe, deterministic, and auditable path for converting `docs/research` content into updates for the runtime `tools` dataset without changing the current recommendation model contract.

This design is Phase 2 architecture only. It intentionally avoids introducing vector search or a retrieval-system rewrite.

## 2. Current Runtime Baseline (Ground Truth)
1. Runtime recommendations are deterministic and SQL-local (`backend/src/services/recommendationService.js`, `backend/src/utils/scoring.js`).
2. Runtime scoring uses weighted `quality`, `speed`, `ease_of_use`, and `pricing_fit` derived from `pricing_tier`.
3. Fallback category routing is deterministic and hard-coded by task category.
4. Runtime data source is PostgreSQL `tools` table seeded by `backend/db/init/002_seed.sql`.
5. Active-tool filtering is enforced via `record_status = 'active'` in `toolRepository`.
6. `tools` constraints already enforce key quality boundaries (`pricing_tier` enum-like check, score ranges 1..5, unique `tool_slug`, unique lower-case `tool_name`) in `backend/db/init/001_schema.sql`.
7. `docs/research` is not consumed at runtime today; mapping is manual (`docs/planning/archive/phase1/2026-03-10-phase1-research-to-seed-utilization.md`).

## 3. Architecture Decision
Adopt a **curation-first ingestion pipeline** that produces reviewed update artifacts before any DB writes.

Pipeline shape:
1. Source eligibility and extraction from `docs/research/*.md`.
2. Normalization into a canonical staging format.
3. Automated validation and conflict detection.
4. Human curation decision (approve/reject/needs-more-evidence).
5. Deterministic DB update generation (seed or migration-safe upsert artifact).
6. QA quality-gate validation before merge.

No direct runtime reads from raw research documents are allowed.

## 4. Data Contracts
### 4.1 Runtime contract (unchanged)
Target runtime fields in `tools`:
1. `tool_name`
2. `tool_slug`
3. `logo_url`
4. `best_for`
5. `website`
6. `referral_url`
7. `category`
8. `pricing`
9. `pricing_tier`
10. `ease_of_use`
11. `speed`
12. `quality`
13. `target_users` (JSON array)
14. `tags` (JSON array)
15. `context_word`
16. `record_status`

### 4.2 Proposed staging artifacts (new)
Under `backend/db/staging/research_ingest/`:
1. `candidate_tools.jsonl` (normalized candidate records)
2. `candidate_evidence.jsonl` (field-level provenance and extraction evidence)
3. `candidate_conflicts.json` (unresolved conflicts)
4. `curation_decisions.json` (final human decisions)
5. `approved_tool_updates.sql` (generated deterministic upserts/deactivations)

## 5. Source Eligibility Rules (`docs/research`)
A file is eligible only if all pass:
1. Markdown file under `docs/research/`.
2. Contains at least one identifiable tool entry with a tool name and website or strong product identity.
3. Contains enough signal for at least required runtime fields (or can be resolved through approved curation policy).
4. Extraction confidence per required field meets threshold (section 9).

A file is ineligible if any apply:
1. Pure narrative with no extractable tool-level facts.
2. Duplicate content with lower detail than an already accepted source.
3. Ambiguous vendor identity not resolvable by curation.
4. Contradicts canonical runtime constraints and cannot be resolved safely.

## 6. Field Mapping and Normalization
### 6.1 Category normalization (allowed runtime set)
1. `Document/PDF`
2. `Research`
3. `Content Creation`
4. `Coding`
5. `Automation`

Reject candidates that cannot map to exactly one allowed category.

### 6.2 Pricing tier normalization
Allowed values:
1. `free`
2. `freemium`
3. `paid_low`
4. `paid_mid`
5. `paid_high`

Unclear pricing requires curator decision; never auto-guess from marketing text.

### 6.3 Score normalization
1. `ease_of_use`, `speed`, `quality` must resolve to integers 1..5.
2. Values outside range are rejected, not clamped silently.
3. Missing scores are allowed only in `candidate_tools` pre-curation; unresolved missing required scores block approval.

### 6.4 Identity normalization
1. Canonical identity key: `tool_slug` (lower kebab-case derived from `tool_name`).
2. If slug collides with existing tool and evidence indicates same vendor/product, treat as update candidate.
3. If slug collides but identity differs, mark conflict and block auto-merge.

## 7. Curation and Conflict-Resolution Rules
Resolution order (highest priority first):
1. Official vendor/product source evidence if present.
2. Most recent credible research document.
3. Existing runtime canonical value if new evidence is weak.
4. Human curator override with rationale in `curation_decisions.json`.

Conflict types:
1. Identity conflict (same name, different product).
2. Category conflict.
3. Pricing/pricing-tier conflict.
4. Score conflict.
5. Website/referral conflict.

Rules:
1. Identity conflicts always require manual resolution.
2. Category conflicts require explicit mapped justification.
3. Score conflicts resolve by median if >= 3 credible observations; else manual decision.
4. Website/referral must preserve secure canonical URL and valid domain.
5. Any unresolved conflict blocks generation of `approved_tool_updates.sql`.

## 8. Data Lifecycle and Update Safety
1. Do not hard-delete existing tools during ingestion.
2. Candidate removals become `record_status = 'inactive'` only with curator approval and explanation.
3. Preserve deterministic runtime behavior by updating fields only; no runtime scoring formula change in this phase.
4. Every approved update must include provenance references in `candidate_evidence.jsonl` and curation decision metadata.
5. Apply updates in a single transaction when executed by backend implementation.

## 9. Confidence Model (for ingestion, not runtime ranking)
Per-field confidence label:
1. `high`: direct, unambiguous source signal.
2. `medium`: inferred from consistent multi-source context.
3. `low`: weak/ambiguous inference.

Approval thresholds:
1. Required identity fields (`tool_name`, `tool_slug`, `website`, `category`) must be `high`.
2. Score and pricing fields must be at least `medium` with no unresolved conflicts.
3. Any required field at `low` blocks approval.

Record-level confidence:
1. `approved` if all required-field thresholds pass and no unresolved conflicts.
2. `review_required` if thresholds fail or conflicts remain.
3. `rejected` if source quality is insufficient or identity cannot be resolved.

## 10. Integration with Current Recommendation Engine
This architecture is designed to preserve current runtime semantics:
1. Scoring formula in `scoring.js` remains unchanged.
2. Category fallback order remains unchanged.
3. `record_status` active-filter behavior remains unchanged.
4. `pricing_tier` normalization aligns with current `getPricingFit` mapping.
5. Existing API contracts remain unchanged; only tool dataset quality/freshness improves.

## 11. Decision on Vector/Semantic Retrieval
Decision for Phase 2: **defer vector/semantic retrieval**.

Rationale:
1. Current product promise is one deterministic recommendation, not exploratory retrieval.
2. Existing catalog size and deterministic scoring are sufficient for current flow.
3. Highest current risk is dataset quality/governance, not retrieval recall.
4. Introducing retrieval now increases complexity and validation surface before ingestion discipline exists.

Revisit checkpoint (future, gated):
1. Active catalog grows beyond 200 tools, or
2. Benchmark failure rate exceeds threshold for two consecutive releases, or
3. Tie-rate and low-confidence recommendation frequency exceed agreed limits for two consecutive releases.

## 12. Non-Goals (This Workstream)
1. No runtime vector DB introduction.
2. No embedding generation pipeline.
3. No frontend contract/UI changes.
4. No edits to `docs/planning/final-implementation-plan.md`.

## 13. Implementation Handoff Guidance
Backend implementation should deliver:
1. Ingestion parser/normalizer for `docs/research`.
2. Validation and conflict report generation.
3. Deterministic SQL artifact generator.
4. Transactional apply command with dry-run mode.

QA implementation should deliver:
1. Ingestion fixture tests across current research files.
2. Conflict and invalid-data test coverage.
3. Release-gate report for each approved dataset update.

## 14. Approval Checklist
1. All required mapping/normalization rules are explicit and testable.
2. Conflict-resolution policy is deterministic and auditable.
3. Confidence thresholds are defined and actionable.
4. Deterministic runtime model remains intact.
5. Vector retrieval is explicitly deferred with concrete revisit triggers.
