# Result Page Hierarchy UX Issue (2026-03-12)

## Risk Summary
- Risk tier: `Medium`
- Area: `Result page information hierarchy`
- User impact: `The page shows "Also consider" before the primary recommendation section, which weakens clarity and makes the product feel less confident.`
- Immutable source of truth respected: `docs/planning/final-implementation-plan.md` was not modified.

## Test Plan
1. Review the result page layout in both locked and unlocked states.
2. Compare current information order with the intended product promise:
   - one clear answer
   - minimal cognitive load
   - no comparison-first experience
3. Identify whether secondary options visually lead the page before the primary recommendation.

Assumptions:
1. The current React result page reflects the active product UI.
2. The intended UX remains primary-first, with alternatives clearly subordinate.

Untested areas:
1. Whether analytics currently show measurable drop-off from this hierarchy issue.
2. Whether the issue feels worse on mobile than desktop.

## Execution Results
### Current UI Evidence
1. In [ResultPage.jsx](/Users/dimouzunov/00%20Coding/05%20TrustMeBroAI/05-TrustMeBroAI/frontend/src/features/result/ResultPage.jsx), the `Also consider` section is rendered before the primary recommendation section.
2. This is true before the conditional render of:
   - unlocked primary recommendation
   - locked primary recommendation

### Why This Is a Problem
1. The product promise is a confident primary answer, not a comparison workflow.
2. Showing secondary options first introduces the wrong hierarchy:
   - the eye lands on alternatives before the main answer
   - the page feels comparison-oriented
   - the primary recommendation loses authority
3. The copy itself becomes awkward:
   - `Also consider` semantically depends on the primary recommendation already being established
   - presenting it first reads backward and weakens UX credibility

### Expected Direction
1. The primary recommendation block, whether locked or unlocked, should lead the result page.
2. Secondary options should appear below the primary block as explicitly subordinate content.
3. The page should feel like:
   - first: `your answer`
   - second: `two fallback alternatives`

## Release Decision
- Verdict: `Open UX issue`

Rationale:
1. This is not a backend blocker, but it is a clear product-quality issue.
2. It directly conflicts with the app’s stated positioning of giving one confident recommendation.
3. It should be corrected before considering the result experience polished.

## Ownership and Next Action
1. Primary owner: `Front-End Specialist`
- Reorder result page hierarchy so primary recommendation appears before alternatives.

2. Validation owner: `QA Specialist`
- Add a visual/manual regression check that confirms:
  - primary section appears first
  - alternatives remain limited to two
  - result page still avoids comparison-style presentation
