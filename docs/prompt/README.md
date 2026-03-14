# Prompt Guardrails

This folder should contain only the currently active prompt set.

## Active prompts

1. `2026-03-14-phase2-sprint2-back-end-specialist.md`
2. `2026-03-14-phase2-sprint2-front-end-specialist.md`
3. `2026-03-14-phase2-sprint2-qa-specialist.md`
4. `2026-03-14-phase2-sprint2-integration-specialist.md`
5. `2026-03-14-marketing-content-specialist.md`
6. `2026-03-14-recommendation-data-architect.md`

All completed or superseded prompts belong in `docs/prompt/archive/`.

## Source-of-truth rule

All prompts in this folder must include the rule:

Do not modify `docs/planning/final-implementation-plan.md`.

This repository treats `docs/planning/final-implementation-plan.md` as the source of truth for active product scope and architecture.

## Local protection

Install repository hooks once:

```bash
npm run hooks:install
```

The pre-commit hook blocks:

1. Any staged change to `docs/planning/final-implementation-plan.md`
2. Any staged prompt in `docs/prompt/*.md` that does not include the required immutable-plan rule
