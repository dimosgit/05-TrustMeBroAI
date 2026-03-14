## 1. Feature Title
`Phase 2 Sprint 3 Front-End Specialist: Follow-the-Build Capture and Auth Polish`

## 2. Objective
Implement the frontend slice of Phase 2 Sprint 3 by adding the follow-the-build capture surface to the landing page, applying the highest-priority approved copy updates, and fixing the remaining auth/transition polish issues. Keep the product minimal, modern, and conversion-safe.

## 3. Context
- Product area: `Landing growth surface and UX polish`
- Current behavior: `Phase 2 Sprint 2 is complete. Marketing strategy and copy recommendations are complete. The landing page still does not include the separate follow-the-build capture required by the final plan, and two frontend polish issues remain open: iOS Safari post-passkey zoom and residual result micro-blink during logged-in auto-unlock.`
- Problem to solve: `We need the first growth-oriented surface to exist in-product, while also tightening the remaining auth UX issues before a broader build-in-public push.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/marketing/2026-03-14-build-in-public-strategy.md`
5. `docs/marketing/2026-03-14-copy-recommendations.md`
6. `docs/planning/2026-03-14-phase2-sprint2-frontend-continuation-note.md`

## 4. Scope
- In scope:
  1. Implement landing-page follow-the-build capture UI.
  2. Apply approved copy recommendations needed for this surface and the wizard loading subtitle.
  3. Fix iOS Safari post-passkey viewport zoom if reproducible in code.
  4. Eliminate or reduce residual `/result` micro-blink during logged-in auto-unlock.
  5. Preserve anonymous wizard/unlock conversion flow quality.
- Out of scope:
  1. Broad landing redesign.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Broad multilingual rollout.
  4. Implementing research ingestion logic in frontend.

## 5. Requirements
1. Landing page must expose a distinct follow-the-build capture surface separate from the main wizard CTA.
2. The new capture must feel secondary but visible, not like a competing primary CTA.
3. Copy changes must align with the approved marketing recommendations.
4. iOS Safari post-passkey viewport behavior and result auto-unlock transition must be improved without hurting main flow stability.
5. `/tasks-progress` must remain internal-only and disabled by default in production behavior.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Keep the landing page focused on one primary product action; follow-the-build capture is secondary.
3. Do not clutter the header or reintroduce noisy navigation.
4. Preserve English output quality and current visual direction.
5. Keep internal routes disabled by default.

## 7. Implementation Notes
1. Use the approved follow-the-build copy direction from marketing docs rather than inventing fresh positioning.
2. Keep the follow-the-build surface light:
   - compact email field + action
   - clear success and error states
   - visually distinct from unlock gate messaging
3. Update the wizard loading subtitle to the recommended stronger version if not already applied.
4. Investigate the auto-unlock micro-blink as a state-transition issue, not a styling-only issue.
5. Document any iOS Safari limitation plainly if full elimination is not feasible in this slice.
6. Add or update a short frontend planning note under `docs/planning/` documenting:
   - follow-the-build UI behavior
   - copy changes made
   - status of the two UX polish issues

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - follow-the-build capture render and submission states
   - landing CTA non-regression
   - wizard loading subtitle update
   - internal route remains disabled by default
   - any code-covered regression around auto-unlock blink behavior

## 9. Acceptance Criteria
1. Landing page includes a separate, clean follow-the-build capture surface.
2. Approved copy changes are reflected without harming conversion-first UX.
3. iOS Safari zoom and result micro-blink are improved or clearly bounded/documented.
4. Anonymous funnel remains strong.

## 10. Deliverables
1. Frontend code implementing the follow-the-build surface and UX polish.
2. Test changes proving correctness and non-regression.
3. A short frontend planning note under `docs/planning/`.
4. Short implementation summary including exact test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend will provide a simple follow-the-build capture contract in this batch.
  2. The main landing CTA should remain the wizard start, not the follow-the-build capture.
- Open questions:
  1. Should follow-the-build success keep the user on landing with inline confirmation, or transition them into an email-confirmation state card?
