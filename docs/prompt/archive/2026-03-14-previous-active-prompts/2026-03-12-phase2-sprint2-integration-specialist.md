## 1. Feature Title
`Phase 2 Sprint 2 Integration Specialist: History and I18n Closeout`

## 2. Objective
Coordinate and validate the Sprint 2 slice so authenticated history, i18n extraction groundwork, and passkey mitigation closeout land cleanly on top of the approved passkey foundation. The goal is to keep the product coherent and prevent Sprint 2 value work from destabilizing auth or the anonymous funnel.

## 3. Context
- Product area: `Cross-agent integration for Sprint 2 product foundation`
- Current behavior: `Passkey auth foundation is implemented and greenlit. Sprint 2 adds history, copy extraction, and mitigation closeout.`
- Problem to solve: `This slice touches backend contracts, frontend UX, QA evidence, and auth posture at once, so integration drift risk is real even without dramatic backend changes.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
3. `docs/planning/2026-03-12-phase2-passkey-integration-closeout-report.md`

## 4. Scope
- In scope:
  1. Validate FE/BE contract alignment for recommendation history.
  2. Validate QA evidence for Sprint 2 changes and passkey mitigation closeout.
  3. Validate auth and anonymous non-regression after history and i18n changes.
  4. Produce merge sequencing and readiness guidance for the Sprint 2 slice.
- Out of scope:
  1. Implementing major new features directly.
  2. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. History contract must be aligned between backend and frontend before merge.
2. i18n extraction must not quietly change active English UX behavior.
3. Passkey mitigation evidence must be explicitly checked, not assumed closed.
4. Anonymous recommendation flow must remain protected.
5. Final integration status must be explicit: `Go`, `Go with Mitigations`, or `No-Go`.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep integration actions minimal and focused.
3. Do not bypass failing checks.

## 7. Implementation Notes
1. Reconcile these areas in one matrix:
   - backend history API
   - frontend history UI
   - i18n extraction impact
   - passkey recovery enrollment nudge
   - QA evidence and real-device sweep
2. Require exact references to changed files, tests, and command outputs.
3. Confirm Sprint 2 work does not accidentally change anonymous wizard access or result rendering rules.
4. Produce a clear merge order and any must-wait dependencies.

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
1. Sprint 2 history and i18n work is integrated cleanly.
2. Passkey mitigation items are evidence-backed.
3. FE, BE, and QA outputs are coherent and reproducible.
4. Integration can recommend the next slice with confidence.

## 10. Deliverables
1. An integration closeout report under `docs/planning/`.
2. Any minimal integration fixes needed for merge readiness.
3. Merge order and release-readiness recommendation.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Sprint 2 is the next active slice after the approved passkey foundation.
- Open questions:
  1. Should metric instrumentation verification be treated as part of this integration gate or deferred to the first analytics dashboard slice?
