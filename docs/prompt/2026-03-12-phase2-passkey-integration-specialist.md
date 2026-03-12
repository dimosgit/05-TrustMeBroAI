## 1. Feature Title
`Phase 2 Integration Specialist: Passkey-First Auth Integration Closeout`

## 2. Objective
Coordinate the first passkey-first Phase 2 implementation slice so FE, BE, and QA stay aligned and the product remains stable. The goal is to prevent contract drift, ensure the anonymous funnel stays protected, and give a clear integration decision before broader Phase 2 work continues.

## 3. Context
- Product area: `Cross-agent integration for Phase 2 auth foundation`
- Current behavior: `The source-of-truth plan now reflects passkey-first auth with email fallback, and the team is starting implementation from that updated baseline.`
- Problem to solve: `Passkey work introduces more moving parts than the previous auth model, so sequencing and contract alignment need tighter control.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`

## 4. Scope
- In scope:
  1. Validate FE/BE contract alignment for passkey registration, sign-in, session bootstrap, and fallback recovery.
  2. Validate QA evidence completeness and reproducibility.
  3. Validate non-regression of the anonymous recommendation flow.
  4. Produce merge sequencing and release-readiness guidance for the first passkey slice.
- Out of scope:
  1. Implementing major auth features directly.
  2. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. FE/BE contract drift must be explicitly checked before merge.
2. QA evidence must cover passkey happy path, recovery path, and anonymous non-regression.
3. Integration must call out any blocker that would make later history/i18n work premature.
4. Final status must be explicit: `Go`, `Go with Mitigations`, or `No-Go`.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep integration changes minimal and focused.
3. Do not bypass failing checks.

## 7. Implementation Notes
1. Reconcile these areas in one matrix:
   - backend endpoint definitions
   - frontend API usage
   - session/bootstrap behavior
   - fallback recovery behavior
   - QA evidence
2. Require exact file references, test references, and command outputs.
3. Validate that anonymous recommendation flow remains non-protected and conversion-first.
4. Produce a merge order note for FE, BE, QA, and integration closeout.

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
1. Integration evidence is complete and reproducible.
2. FE, BE, and QA outputs are aligned with the updated final plan.
3. Anonymous funnel remains protected.
4. Integration provides a clear recommendation for moving to the next Phase 2 slice.

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
  1. The team wants to ship passkey auth in a controlled first slice before taking on full history and i18n rollout together.
- Open questions:
  1. Should i18n extraction wait until after passkey closeout, or can it start in parallel as a separate frontend track once auth contracts are stable?
