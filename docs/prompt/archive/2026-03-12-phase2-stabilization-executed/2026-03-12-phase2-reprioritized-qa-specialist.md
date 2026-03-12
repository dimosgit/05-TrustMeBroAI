## 1. Feature Title
`QA Specialist: P0 UX Regression Gate and Phase 2 Readiness Check`

## 2. Objective
Validate the current high-priority regressions and UX fixes before the team proceeds into passkey-first expansion. The immediate goal is to ensure the current product is not broken or misleading in the most visible areas, while also capturing evidence needed to safely move into the next auth phase.

## 3. Context
- Product area: `Cross-layer QA for current regressions and near-term release quality`
- Current behavior: `The current product has live UX and auth-value regressions that reduce trust before new auth work begins.`
- Problem to solve: `We need a tight regression gate on the current flow so the team does not stack passkey work on top of unresolved UX and integration issues.`

Reference findings and planning inputs:
1. `docs/planning/2026-03-12-authenticated-user-primary-recommendation-regression.md`
2. `docs/planning/2026-03-12-result-page-hierarchy-ux-issue.md`
3. `docs/planning/2026-03-10-post-phase1-next-action-plan.md`

## 4. Scope
- In scope:
  1. Validate the fix for authenticated user -> primary recommendation unlock.
  2. Validate result-page hierarchy improvements.
  3. Validate header simplification on mobile and desktop.
  4. Validate sticky or persistent mobile wizard navigation.
  5. Validate non-regression of the anonymous wizard and unlock flow.
  6. Assess whether the product is stable enough to proceed into passkey-first design/implementation.
- Out of scope:
  1. Implementing new product features outside necessary QA-owned test fixes.
  2. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. QA must explicitly test the current highest-risk user journeys, not just command-level pass/fail.
2. The report must include both `Functional Verdict` and `UX Verdict`.
3. Mobile and desktop must both be covered for header and wizard navigation changes.
4. QA must confirm whether the app still feels aligned with the “one clear answer” product promise after the FE fixes.
5. QA must identify whether any issue remains severe enough to block passkey-first phase work.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Treat flaky tests as defects.
3. Keep this gate focused on current regressions and readiness, not on speculative passkey implementation behavior.

## 7. Implementation Notes
1. Required manual scenarios:
   - authenticated user -> wizard -> result -> primary auto-unlocks without email re-entry
   - anonymous user -> wizard -> locked result -> email unlock still works
   - result page hierarchy shows primary before alternatives
   - unauthenticated header is simplified and non-crowded
   - mobile wizard controls remain visible after selecting a mission or priority
2. Required automated coverage should be updated where gaps exist.
3. If a cloud/browser QA environment is available, include click-through evidence from the deployed build.
4. Report any residual confusion in copy, hierarchy, or navigation as UX findings even if functionally correct.

## 8. Test Requirements
1. Add or update automated tests for any QA-owned fixes.
2. Run relevant checks before commit:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Logged-in users no longer encounter the locked-primary dead end.
2. Result-page hierarchy feels primary-first and non-comparison-oriented.
3. Header and wizard navigation changes improve clarity on both mobile and desktop.
4. Anonymous unlock flow remains stable.
5. QA provides an explicit release/readiness verdict for moving into passkey-first phase work.

## 10. Deliverables
1. A dated QA report under `docs/planning/`.
2. Any test fixes required to make the verdict trustworthy.
3. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. FE owns most of the code changes for the current visible regressions.
- Open questions:
  1. If header simplification is functionally correct but still visually noisy, should that be a release blocker or a mitigation?
