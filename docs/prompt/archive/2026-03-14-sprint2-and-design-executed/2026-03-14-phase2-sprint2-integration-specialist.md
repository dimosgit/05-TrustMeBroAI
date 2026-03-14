## 1. Feature Title
`Phase 2 Sprint 2 Integration Specialist: Contract Reconciliation, Auth Non-Regression, and Merge Closeout`

## 2. Objective
Drive the final integration and closeout of Phase 2 Sprint 2. Reconcile backend and frontend history behavior, verify that copy extraction and recovery-enrollment guidance landed cleanly, and block merge if anonymous conversion flow or passkey-first auth credibility regressed.

## 3. Context
- Product area: `Cross-agent Sprint 2 integration and merge readiness`
- Current behavior: `Sprint 2 implementation is split across backend, frontend, QA, and a parallel marketing support workstream.`
- Problem to solve: `We need one final integration pass that checks contracts, regressions, and release readiness before Sprint 2 is treated as complete.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
3. `PROJECT_STATUS.md`

## 4. Scope
- In scope:
  1. Reconcile backend and frontend history contract usage.
  2. Verify recovery-based enrollment guidance is correctly wired end to end.
  3. Confirm English copy extraction did not create cross-surface regressions.
  4. Review QA results and decide merge readiness for Sprint 2.
  5. Archive superseded prompt references or coordination notes if needed after closeout.
- Out of scope:
  1. Fresh feature implementation unless a minimal integration fix is required.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Marketing strategy decisions beyond acknowledging the support workstream.

## 5. Requirements
1. Validate that backend and frontend agree on the history contract and state handling.
2. Validate that recovery verify, session bootstrap, and enrollment guidance work as one coherent flow.
3. Validate that anonymous wizard and unlock behavior still match the product promise.
4. Review QA findings and mark Sprint 2 as `Go`, `Go with known risks`, or `No-Go`.
5. Produce a short integration closeout report with exact blockers, if any.
6. Treat `/tasks-progress` as internal-only and block go-live if it remains shipped.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Prefer minimal integration fixes and explicit escalation over broad rewrites.
3. Do not approve Sprint 2 if the anonymous funnel, unlocked result experience, or passkey-first posture regresses.
4. Keep documentation clear enough that the next batch can start without ambiguity.

## 7. Implementation Notes
1. Review BE, FE, and QA deliverables first before changing anything.
2. Check both contract alignment and user-flow alignment.
3. If integration issues appear, classify them clearly:
   - blocker
   - should-fix-soon
   - acceptable follow-up
4. Save the final integration report under `docs/planning/`.
5. If the batch is complete, prepare the prompt/planning handoff for the next batch.

## 8. Test Requirements
1. Re-run relevant validation as needed before final signoff:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend unit tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
2. Do not create a commit if any required validation fails.
3. Confirm QA coverage exists for:
   - history
   - English copy parity
   - passkey mitigation closeout
   - anonymous funnel non-regression
   - `/tasks-progress` removal or disablement before production

## 9. Acceptance Criteria
1. Sprint 2 has a clear integration closeout decision.
2. History, i18n extraction, and recovery-enrollment guidance are coherent end to end.
3. Anonymous flow remains intact.
4. The next batch can start from a clean, documented state.
5. Go-live is blocked if `/tasks-progress` remains exposed in the production route set.

## 10. Deliverables
1. Sprint 2 integration closeout report under `docs/planning/`.
2. Any minimal integration fixes required for readiness.
3. Short implementation summary including exact commands executed and outcomes.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of hiding them.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. BE, FE, and QA will each produce a short handoff note or report for review.
- Open questions:
  1. Are any known Sprint 2 risks acceptable to carry, or is the desired bar full closeout with no open mitigations?
