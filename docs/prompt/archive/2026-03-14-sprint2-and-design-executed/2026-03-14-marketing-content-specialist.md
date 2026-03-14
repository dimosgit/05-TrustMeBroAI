## 1. Feature Title
`Marketing and Content Specialist: Copy Audit, Build-in-Public Strategy, and Message Priorities`

## 2. Objective
Use the current product copy, final implementation plan, and current product state to produce a practical marketing and content strategy for TrustMeBroAI. The goal is to sharpen positioning, improve trust and clarity, and define a realistic build-in-public plan that can grow awareness without drifting from the actual product.

## 3. Context
- Product area: `Marketing, messaging, copy direction, and build-in-public growth`
- Current behavior: `The app is live with landing, wizard, auth, and result flows. A current-copy baseline now exists in docs, but there is still no completed marketing strategy or copy recommendation package.`
- Problem to solve: `We need a grounded marketing/content pass that turns current product reality into a clear positioning and content system the team can act on.`

Planning and product references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/marketing/2026-03-13-current-copy-baseline.md`
4. `frontend/src/lib/i18n/locales/en.js`
5. `frontend/src/features/landing/LandingPage.jsx`

## 4. Scope
- In scope:
  1. Audit current product messaging against the final plan and current app behavior.
  2. Propose a practical build-in-public strategy.
  3. Recommend copy priorities for landing, unlock, auth, and follow-the-build messaging.
  4. Define channel and content priorities realistic for the current stage.
- Out of scope:
  1. Editing application code.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Repositioning the product into a comparison tool or a broad AI research platform.
  4. Inventing unreleased features in core messaging as if they already exist.

## 5. Requirements
1. Use the final implementation plan as the source of truth for product promise and business constraints.
2. Keep recommendations aligned with the current core value proposition:
   - one clear answer
   - fast decision under 60 seconds
   - minimal cognitive load
   - email capture as a real business objective
3. Explicitly account for the plan’s separate `follow the build` capture and turn it into a usable build-in-public recommendation.
4. Evaluate current copy and call out:
   - what is strong
   - what is weak or generic
   - what hurts trust
   - what should be tested first
5. Produce practical output, not broad theory:
   - message hierarchy
   - audience prioritization
   - channel plan
   - content themes
   - copy recommendations

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Ground all recommendations in current repo evidence and current app reality.
3. Save all deliverables under `docs/marketing/`.
4. Do not treat future product ideas as already shipped behavior.
5. Do not recommend messaging that reintroduces comparison-heavy UX or dilutes the one-answer promise.

## 7. Implementation Notes
1. Start with `docs/marketing/2026-03-13-current-copy-baseline.md` and validate it against current app text if needed.
2. Produce the following documents under `docs/marketing/`:
   - `docs/marketing/2026-03-14-marketing-copy-audit.md`
   - `docs/marketing/2026-03-14-build-in-public-strategy.md`
   - `docs/marketing/2026-03-14-copy-recommendations.md`
3. The copy audit should cite concrete current strings or surfaces.
4. The strategy document should prioritize realistic channels and content loops for a small team.
5. The copy recommendations should include suggested directions for:
   - landing page
   - unlock gate
   - follow-the-build capture
   - register/login framing
6. If you recommend experiments, keep them few and high-confidence.

## 8. Test Requirements
1. No application code changes are required in this task.
2. Validation before commit:
   - confirm all recommendations are grounded in current repo files and active planning docs
   - confirm all new files are saved under `docs/marketing/` only
   - confirm the work does not modify `docs/planning/final-implementation-plan.md`
3. Do not create a commit if the deliverables are incomplete or not grounded in repo evidence.

## 9. Acceptance Criteria
1. We have a clear written audit of the current messaging.
2. We have a practical build-in-public strategy tailored to TrustMeBroAI.
3. We have concrete copy recommendations for the main product and capture surfaces.
4. The recommendations stay aligned with the actual shipped or planned product.

## 10. Deliverables
1. `docs/marketing/2026-03-14-marketing-copy-audit.md`
2. `docs/marketing/2026-03-14-build-in-public-strategy.md`
3. `docs/marketing/2026-03-14-copy-recommendations.md`
4. A short implementation summary stating:
   - files created
   - repo sources reviewed
   - top 5 recommendations

## 11. Mandatory Agent Rules
1. Ground every recommendation in the current repo state.
2. Do not edit application code in this task unless explicitly asked later.
3. Do not modify `docs/planning/final-implementation-plan.md`.
4. Keep recommendations concrete, prioritized, and realistic for the current phase.
5. Escalate contradictions instead of inventing product direction.

## 12. Assumptions and Open Questions
- Assumptions:
  1. This marketing pass is strategy and copy direction only, not implementation.
  2. The current-copy baseline is accurate enough to use as the starting point.
- Open questions:
  1. Should the first marketing push optimize primarily for email list growth, wizard starts, or unlocked recommendations?
