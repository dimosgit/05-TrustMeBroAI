# Phase 1 Research-to-Seed Utilization (Manual Curation)

Date: 2026-03-11  
Scope: Phase 1 only (manual curation, no automation pipeline)

## 1) Seed-Input Candidate Files (`docs/research`)

Primary Phase 1 curation inputs:
1. `docs/research/AI Tools for Document Analysis.md`
2. `docs/research/AI Research Tool Database Population.md`
3. `docs/research/AI tools used for writing and content generation.md`
4. `docs/research/AI Developer Tools Research.md`
5. `docs/research/AI Automation Tool Research For Database.md`

Secondary/supporting references:
1. `docs/research/AI Consultants Tools Research.md`
2. `docs/research/ai_productivity_tools_knowledge_workers.md`
3. `docs/research/Artificial Intelligence in Data Analysis.md`
4. `docs/research/AI_Tool_Research_for_IT_Professionals.md`
5. `docs/research/AI Tools for Presentation Creation.md`

## 2) Field Mapping to `backend/db/init/002_seed.sql`

Research source -> Seed field:
1. `Tool Name` -> `tool_name`
2. Normalized tool name -> `tool_slug` (lowercase kebab-case, unique)
3. `Website` -> `website`
4. `Best for` / `Primary Use Case` -> `best_for`
5. `Category` -> `category` (normalized to Phase 1 universe)
6. `Pricing Model` / pricing notes -> `pricing` + `pricing_tier`
7. `Ease of Use (1-5)` -> `ease_of_use`
8. `Quality (1-5)` -> `quality`
9. `Speed (1-5)` -> `speed`
10. `Typical Users` -> `target_users`
11. tags inferred from use-case keywords -> `tags`
12. short context descriptor -> `context_word`

## 3) Category Normalization Rules

Allowed Phase 1 categories:
1. `Document/PDF`
2. `Research`
3. `Content Creation`
4. `Coding`
5. `Automation`

Normalization mapping:
1. Document intelligence / PDF parsing / document AI -> `Document/PDF`
2. Academic research / market research / discovery -> `Research`
3. Writing / copy / social / presentation creation -> `Content Creation`
4. Developer tools / IDE / code assistant -> `Coding`
5. Workflow automation / agent automation / RPA -> `Automation`

Any tool that cannot be mapped cleanly to one of the five categories is excluded from Phase 1 seed.

## 4) Pricing Tier Normalization Rules

Allowed values:
1. `free`
2. `freemium`
3. `paid_low`
4. `paid_mid`
5. `paid_high`

Manual mapping policy:
1. Open-source or free-only -> `free`
2. Free tier + paid plans -> `freemium`
3. Paid plans with low entry pricing -> `paid_low`
4. Paid plans with standard SMB/pro pricing -> `paid_mid`
5. Enterprise/custom/opaque high-cost orientation -> `paid_high`

If source pricing is ambiguous, keep conservative text in `pricing` and assign `pricing_tier` via explicit manual reviewer decision.

## 5) Conflict Resolution Rules (Manual)

1. Prefer official product/vendor source over tertiary commentary.
2. Prefer category-specialized research doc when scores conflict.
3. For score conflicts (`ease_of_use`, `quality`, `speed`):
   - use median/consensus from available sources when possible
   - clamp final values to `1..5`
4. If required numeric values are missing and cannot be confidently inferred, do not add tool to Phase 1 seed.
5. Keep scoring deterministic: never use dynamic/runtime external scoring inputs in Phase 1.

## 6) Current Phase 1 Seed Decision Summary

Current `002_seed.sql` is already aligned with Phase 1 scoring contract:
1. 25 curated tools (`5` per category in the five-category universe)
2. `pricing_tier` restricted to allowed set (`free|freemium|paid_low|paid_mid|paid_high`)
3. only active tools are used for scoring (`record_status = 'active'`)

No additional seed row changes were required for this hardening task.
