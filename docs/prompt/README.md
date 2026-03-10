# Prompt Guardrails

All prompts in this folder must include the rule:

Do not modify `docs/planning/final-implementation-plan.md`.

This repository treats `docs/planning/final-implementation-plan.md` as immutable source of truth.

## Local protection

Install repository hooks once:

```bash
npm run hooks:install
```

The pre-commit hook blocks:

1. Any staged change to `docs/planning/final-implementation-plan.md`
2. Any staged prompt in `docs/prompt/*.md` that does not include the required immutable-plan rule
