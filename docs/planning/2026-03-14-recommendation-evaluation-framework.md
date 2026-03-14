# Recommendation Evaluation Framework (Dataset Update Gates)

Date: 2026-03-14  
Owner: Recommendation Data Architect + QA Specialist  
Status: Proposed for approval

## 1. Goal
Define objective quality gates for research-driven dataset updates so recommendation behavior improves (or stays stable) without regressing deterministic reliability.

This framework evaluates dataset changes before merge and after apply. It does not change the scoring algorithm.

## 2. Evaluation Principles
1. Deterministic behavior first: identical inputs must produce identical outputs on a fixed dataset.
2. Dataset quality before algorithm complexity.
3. Evidence-backed changes only.
4. Fail closed: unresolved conflicts or failing gates block release.

## 3. Evaluation Layers
### Layer A: Ingestion Integrity (pre-runtime)
Checks:
1. Schema validity for candidate artifacts.
2. Required fields present for all approved candidates.
3. Allowed-value checks (`category`, `pricing_tier`, score range 1..5).
4. Identity uniqueness (`tool_slug`, lower-case `tool_name` collision detection).
5. Conflict file empty or fully resolved via curator decisions.

Gate result:
1. Pass -> continue.
2. Fail -> release blocked.

### Layer B: Deterministic Recommendation Regression (offline)
Run benchmark scenarios against:
1. Baseline dataset (current production-aligned).
2. Candidate dataset (proposed updates).

For each scenario, compute:
1. Primary tool change (yes/no).
2. Alternative set change (yes/no).
3. Reason sentence validity and format.
4. Fallback-category usage.

Gate rule:
1. Unexpected behavior deltas require curator/architect sign-off.
2. Contract violations (invalid fields, missing top 3, malformed reason) are hard failures.

### Layer C: Outcome Proxy Quality
Using historical and synthetic scenario sets:
1. Estimate recommendation-confidence distribution.
2. Track tie frequency and fallback frequency.
3. Track unstable recommendations (frequent primary changes from minor data edits).
4. Validate category relevance by scenario intent.

Gate rule:
1. Exceeding thresholds (section 6) blocks release unless explicitly waived.

### Layer D: Human Review
1. Manual review sample from changed tools.
2. Manual review sample from changed recommendation outputs.
3. Reviewer records accept/reject with rationale.

Gate rule:
1. Any critical reviewer rejection blocks release.

## 4. Benchmark Scenario Suite
Maintain versioned benchmark file under `docs/planning/benchmarks/recommendation-benchmark-v1.json` (to be created by QA/BE implementation).

Minimum scenario coverage:
1. Every task category at least 5 scenarios.
2. Every priority at least 5 scenarios.
3. At least one fallback-trigger scenario per category.
4. Edge cases:
   - sparse category
   - near-tie scores
   - ambiguous pricing data
   - profile-sensitive tiebreak

Scenario fields:
1. `profile_name`
2. `task_name`
3. `selected_priority`
4. `expected_category_set`
5. `expected_primary_tool` (when deterministic expectation is strict)
6. `allowed_primary_set` (when multiple acceptable outcomes exist)

## 5. Metrics to Track Per Candidate Release
1. `primary_change_rate`: % scenarios where primary changes vs baseline.
2. `alternative_change_rate`: % scenarios where alternatives change vs baseline.
3. `fallback_usage_rate`: % scenarios using fallback categories.
4. `tie_break_rate`: % scenarios requiring tie resolution.
5. `low_confidence_record_rate`: % approved records with any low-confidence required field (target 0).
6. `manual_override_rate`: % changed records requiring curator override.
7. `contract_failure_count`: count of output contract violations.

## 6. Initial Regression Thresholds (Phase 2)
1. `contract_failure_count` must be 0.
2. `low_confidence_record_rate` must be 0%.
3. `manual_override_rate` <= 20% of changed records.
4. `primary_change_rate` <= 25% unless release is explicitly marked as major-catalog refresh.
5. `fallback_usage_rate` must not increase by more than 10 percentage points vs baseline.
6. Any scenario-level critical mismatch in manually pinned scenarios blocks release.

These thresholds are conservative starter values and can be tuned after 3 release cycles with evidence.

## 7. Human Review Protocol
Review roles:
1. Data curator (source/evidence correctness).
2. Product/recommendation reviewer (fit with one-answer product promise).
3. QA reviewer (contract and regression correctness).

Required sample sizes per release:
1. 100% of newly added tools.
2. 30% random sample of updated tools (minimum 10).
3. 20 benchmark scenarios with changed primary results.

Review checklist:
1. Tool identity correct.
2. Category mapping reasonable.
3. Pricing and score normalization justified.
4. Recommendation output still understandable and high-confidence.
5. No drift toward comparison-engine behavior.

## 8. Release Decision Matrix
1. `Approve`: all gates pass.
2. `Approve with exceptions`: non-critical threshold warnings, explicit sign-off required.
3. `Reject`: any hard failure or unresolved critical review finding.

Hard failures:
1. Contract failure.
2. Unresolved identity/category conflict.
3. Required-field confidence below threshold.
4. Missing provenance for changed required fields.

## 9. Traceability and Evidence
Each release candidate must produce:
1. `evaluation-summary.md` with metric deltas vs baseline.
2. Scenario diff report (`scenario-diff.json`).
3. Human review outcomes (`review-decisions.json`).
4. Final go/no-go statement with approver names and timestamp.

Store under `docs/planning/release-evidence/<release-date-or-id>/`.

## 10. Post-Apply Monitoring
After approved apply:
1. Compare first 7 days of funnel events (`recommendation_unlocked`, `try_it_clicked`) vs prior period.
2. Monitor anomaly in unlock-to-try-it ratio.
3. If material degradation appears, trigger rollback decision review.

Monitoring does not replace pre-merge gates.

## 11. Vector Retrieval Reconsideration Signal (Evaluation-linked)
Vector/semantic retrieval remains deferred now.

Trigger a formal architecture review only if both hold for two consecutive approved releases:
1. `primary_change_rate` is high but manual quality rating still low-confidence for many scenarios, and
2. scenario failures indicate missing semantic matching signal, not data-quality issues.

## 12. Required Commands for Future Implementation PRs
When backend/QA implement this framework, required CI-local checks should include at minimum:
1. `cd backend && npm run lint`
2. `cd backend && npm run test`
3. `cd backend && npm run test:integration`
4. Ingestion/evaluation command (to be added by implementation), for example:
   - `cd backend && npm run research:ingest:dry-run`
   - `cd backend && npm run recommendation:evaluate`

No commit on failing tests or failing evaluation gates.
