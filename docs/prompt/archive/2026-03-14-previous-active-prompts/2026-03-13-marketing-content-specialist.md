## 1. Feature Title
`Marketing and Content Specialist: Positioning Audit, Build-in-Public Strategy, and Copy Direction`

## 2. Objective
Analyze the current product messaging, landing copy, product constraints, and existing ideas so we can define a clear marketing strategy for TrustMeBroAI. The goal is to improve popularity and clarity without drifting from the product: one confident AI tool recommendation with low cognitive load and strong email capture. This first pass is strategy and copy direction work, not implementation.

## 3. Context
- Product area: `Positioning, messaging, content strategy, and build-in-public growth`
- Current behavior: `The app has live landing, wizard, auth, and result flows. Core product positioning exists in the final implementation plan and current frontend English copy, but there is no dedicated marketing strategy or content system yet.`
- Problem to solve: `We need a grounded marketing/content specialist pass that audits what we currently say, identifies weak or confusing messaging, and proposes a practical strategy to grow attention and trust around the product.`

Planning and product references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `frontend/src/lib/i18n/locales/en.js`
4. `frontend/src/features/landing/LandingPage.jsx`
5. `docs/research/` only if useful for understanding product context, not as runtime truth

## 4. Scope
- In scope:
  1. Audit current landing and product copy for clarity, trust, differentiation, and conversion fit.
  2. Identify where the current messaging does and does not match the final implementation plan.
  3. Propose a build-in-public marketing strategy that fits the product and founder workflow.
  4. Recommend copy improvements for landing, unlock, auth, and follow-the-build messaging.
  5. Produce practical deliverables we can use to guide future implementation and content work.
- Out of scope:
  1. Direct code implementation in frontend or backend.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Inventing a different product model than the one already defined.
  4. Broad brand redesign unrelated to the current product direction.

## 5. Requirements
1. Use the final implementation plan as the source of truth for product promise, UX model, and business constraints.
2. Explicitly account for the product promise:
   - one clear answer, not comparison overload
   - fast decision in under 60 seconds
   - minimal cognitive load
   - email capture as a primary business objective
3. Explicitly account for the build-in-public direction already present in the plan through the separate `follow the build` capture.
4. Review the current English product text and identify:
   - what is already strong
   - what is weak, vague, or generic
   - what creates friction or undermines trust
5. Produce a concrete marketing strategy, not generic advice:
   - audience segments
   - positioning
   - core messaging pillars
   - channel recommendations
   - build-in-public content angles
   - copy priorities
6. Include recommendations for how to distinguish:
   - recommendation unlock email capture
   - account/auth messaging
   - follow-the-build marketing capture
7. Keep recommendations realistic for the current phase and team size.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Do not treat `docs/research/` as live runtime behavior; use runtime code and active planning docs for current-state truth.
3. Keep all new deliverables in documentation only.
4. Do not propose comparison-heavy messaging that conflicts with the product promise of one confident recommendation.
5. Do not propose a marketing strategy that depends on unreleased features as if they already exist.

## 7. Implementation Notes
1. Start by auditing the current user-facing text in the landing page and active English locale file.
2. Cross-check that text against the final plan:
   - target users
   - value proposition
   - UX flow
   - build-in-public / follow-the-build capture
3. Produce the following documents under `docs/marketing/`:
   - `docs/marketing/2026-03-13-marketing-copy-audit.md`
   - `docs/marketing/2026-03-13-build-in-public-strategy.md`
   - `docs/marketing/2026-03-13-copy-recommendations.md`
4. The copy audit should call out specific current strings or surfaces when possible.
5. The strategy document should prioritize practical channels and content loops over vague brand theory.
6. The copy recommendations document should include suggested headline/subheadline/CTA directions for:
   - landing page
   - follow-the-build capture
   - unlock gate framing
   - register/login framing
7. If you recommend experiments, prioritize only a small number of high-confidence tests.

## 8. Test Requirements
1. No application code changes are required in this task.
2. Validation before commit:
   - Confirm all recommendations are grounded in current repo files and active planning docs.
   - Confirm all new files are saved under `docs/marketing/` only.
   - Confirm the work does not modify `docs/planning/final-implementation-plan.md`.
3. Do not create a commit if the deliverables are missing any of the required sections or are not grounded in repo evidence.

## 9. Acceptance Criteria
1. We have a clear written audit of the current messaging and where it conflicts with or supports the product strategy.
2. We have a practical build-in-public marketing strategy tailored to TrustMeBroAI, not generic startup advice.
3. We have concrete copy recommendations for the main product surfaces and email capture surfaces.
4. The recommendations respect the current product model and current phase boundaries.

## 10. Deliverables
1. `docs/marketing/2026-03-13-marketing-copy-audit.md`
2. `docs/marketing/2026-03-13-build-in-public-strategy.md`
3. `docs/marketing/2026-03-13-copy-recommendations.md`
4. A short implementation summary stating:
   - files created
   - repo sources reviewed
   - top 5 marketing/copy recommendations

## 11. Mandatory Agent Rules
1. Ground every recommendation in the current repo state.
2. Do not edit application code in this task unless explicitly asked later.
3. Do not modify `docs/planning/final-implementation-plan.md`.
4. Keep recommendations concrete, prioritized, and phase-aware.
5. Escalate contradictions instead of silently inventing product direction.
6. If a recommendation depends on a future feature, label it clearly as future-state.

## 12. Assumptions and Open Questions
- Assumptions:
  1. This first marketing/content pass is strategy and copy guidance only, not production implementation.
  2. The separate `follow the build` capture from the final plan is the primary anchor for build-in-public messaging.
- Open questions:
  1. Which channels should be prioritized first for build-in-public: LinkedIn, X, email newsletter, or product communities?
  2. Should the first marketing pass optimize primarily for email list growth, wizard starts, or unlocked recommendations?
