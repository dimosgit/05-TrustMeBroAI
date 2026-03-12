## 1. Feature Title
`Integration Specialist: Reprioritized P0 Closeout and Phase 2 Passkey Launch Sequencing`

## 2. Objective
Coordinate the correct order of work so the team fixes current trust-breaking issues before starting passkey-first auth expansion. The goal is to prevent architecture drift, merge confusion, and product-quality regressions while moving the project toward the new next-phase direction.

## 3. Context
- Product area: `Cross-agent integration and release sequencing`
- Current behavior: `The team has identified several live UX/auth issues plus a new strategic auth direction (passkey-first), which must be sequenced carefully.`
- Problem to solve: `We need to make sure current blockers are resolved first, and that passkey work starts only after the current product is stable enough to build on.`

Reference findings and planning inputs:
1. `docs/planning/2026-03-12-authenticated-user-primary-recommendation-regression.md`
2. `docs/planning/2026-03-12-result-page-hierarchy-ux-issue.md`
3. `docs/planning/2026-03-10-post-phase1-next-action-plan.md`

## 4. Scope
- In scope:
  1. Validate that FE, BE, and QA are executing the current priorities in the right order.
  2. Confirm current P0 regressions are closed before recommending passkey implementation start.
  3. Reconcile FE/BE contract stability for remembered-user unlock.
  4. Reconcile next-phase readiness for passkey-first auth, i18n prep, and navigation/mobile UX work.
  5. Publish final sequencing and merge guidance.
- Out of scope:
  1. Implementing passkeys directly.
  2. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. Current P0 user-facing regressions must be resolved before passkey implementation begins.
2. FE and BE must not diverge on the remembered-user unlock contract.
3. QA evidence must explicitly cover current blockers before the project is declared ready for Phase 2 auth expansion.
4. Integration must produce a recommended order for:
   - immediate regression fixes
   - design-lock documentation
   - passkey-first implementation start
5. Integration must call out any residual blocker that would make passkey work premature.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Treat passkey as next-phase work, not immediate implementation in this closeout.
3. Keep integration changes minimal and focused on sequencing, validation, and merge readiness.

## 7. Implementation Notes
1. Required execution order to validate:
   - FE fixes authenticated unlock regression and core UX blockers
   - BE validates and, if necessary, stabilizes remembered-user unlock contract
   - QA re-runs regression gate on current flow
   - only then is passkey-first design-lock/implementation work cleared to start
2. Require explicit references to:
   - files changed
   - tests added/updated
   - command results
   - QA verdict
3. Reconcile whether i18n extraction and header/mobile UX changes should land in the same frontend branch or be split after the P0 unlock fix.

## 8. Test Requirements
1. Re-run or sample-rerun critical checks before final sign-off:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`
   - `cd frontend && npm run test`
   - `cd frontend && npm run test:e2e:smoke`
2. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. The current product regressions are closed in the right order.
2. FE/BE/QA evidence is coherent and reproducible.
3. Integration provides a clear `start now` recommendation for the next passkey-first phase, or a clear blocker if not ready.
4. Merge order is explicit and practical.

## 10. Deliverables
1. An integration closeout note under `docs/planning/`.
2. Any minimal integration fixes needed for merge readiness.
3. A merge and sequencing recommendation with rationale.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. The team wants current UX/auth trust issues resolved before starting new auth implementation complexity.
- Open questions:
  1. Should FE ship the P0 unlock regression fix separately before the larger navigation/mobile UX changes, or bundle them in one stabilization pass?
