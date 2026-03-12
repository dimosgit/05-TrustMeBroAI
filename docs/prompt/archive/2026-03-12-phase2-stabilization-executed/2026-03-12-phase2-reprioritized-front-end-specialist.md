## 1. Feature Title
`Front-End Specialist: P0 UX and Auth Regression Hardening`

## 2. Objective
Fix the current user-facing regressions and UX weaknesses before starting new auth expansion work. The immediate goal is to restore trust in the current flow, improve result-page clarity, simplify header navigation, and make the wizard easier to complete on mobile. Do not change the product scope in `docs/planning/final-implementation-plan.md`.

## 3. Context
- Product area: `Frontend product UX`
- Current behavior: `Current auth and result UI contain credibility and hierarchy issues that undermine the product even before passkey work begins.`
- Problem to solve: `The app currently has a broken logged-in unlock experience and several UI patterns that feel noisy or backward.`

Reference findings to follow in this exact priority order:
1. `docs/planning/2026-03-12-authenticated-user-primary-recommendation-regression.md`
2. `docs/planning/2026-03-12-result-page-hierarchy-ux-issue.md`
3. `docs/planning/2026-03-10-post-phase1-next-action-plan.md`

## 4. Scope
- In scope:
  1. Fix the authenticated-user unlock regression so logged-in users do not stay blocked behind the primary recommendation lock.
  2. Reorder the result page so the primary recommendation always leads and alternatives remain subordinate.
  3. Simplify unauthenticated header navigation:
     - remove `Start Wizard` from persistent header navigation
     - reduce unauthenticated header actions to one clear primary action
  4. Improve mobile wizard navigation with a persistent `Back` / `Continue` action pattern.
  5. Preserve the anonymous conversion-first path and current visual quality.
- Out of scope:
  1. Implementing passkeys.
  2. Changing the final implementation plan.
  3. Full i18n extraction in this prompt unless needed for touched components.

## 5. Requirements
1. Logged-in users must be able to reach an unlocked primary recommendation without re-entering email.
2. The result page must present the primary recommendation before `Also consider`.
3. Alternatives must remain limited to two and visually subordinate.
4. The unauthenticated header must not show `Register`, `Login`, and `Start Wizard` all at once.
5. Mobile users must not need to scroll just to find the next-step wizard controls after making a selection.
6. The landing and wizard flow must still feel minimal, modern, and conversion-first.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Do not drift into passkey implementation or auth product redesign in this prompt.
3. Keep the current result contract:
   - no comparison tables
   - no score visualizations
   - maximum 3 visible tools
4. Preserve responsive behavior across mobile and desktop.

## 7. Implementation Notes
1. Fix the remembered-user unlock trigger in the result flow using authenticated session state, not only local storage marker state.
2. Validate the unlock path still works for anonymous users and returning users.
3. Rework the result-page hierarchy so the primary card appears first in both locked and unlocked states.
4. For header simplification, prefer one clear unauthenticated CTA and move wizard entry to context-appropriate in-page surfaces.
5. For the mobile wizard, use a sticky bottom action bar or equivalent persistent control pattern, provided it does not obscure content or validation states.
6. Keep design coherence with the existing visual language. Avoid making the header or wizard feel heavier as a side effect of simplification.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - authenticated user -> result auto-unlocks without re-entering email
   - result page renders primary recommendation before alternatives
   - unauthenticated header no longer exposes crowded CTA set
   - mobile wizard navigation controls remain discoverable
   - anonymous unlock flow still works

## 9. Acceptance Criteria
1. Logged-in users no longer hit the locked-primary dead end.
2. Result-page information hierarchy matches the “one clear answer” product promise.
3. Header navigation is clear and non-crowded on mobile and desktop.
4. Wizard progression is obvious on mobile without scroll-hunting for controls.
5. No regression is introduced in the anonymous wizard and unlock path.

## 10. Deliverables
1. Frontend code changes implementing the prioritized P0 UX and auth regression fixes.
2. Test changes proving correctness and non-regression.
3. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend remembered-user unlock contract already exists and only needs frontend alignment unless proven otherwise.
- Open questions:
  1. Which single unauthenticated header action should be primary after simplification: `Account`, `Register`, or `Login`?
