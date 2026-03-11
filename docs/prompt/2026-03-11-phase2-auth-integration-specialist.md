## 1. Feature Title
`Phase 2 Auth Integration Specialist: Register/Login Integration Closeout`

## 2. Objective
Run final integration and merge gate for explicit register/login rollout. Confirm FE/BE/QA outputs are coherent, contract-aligned, and production-safe.

## 3. Context
- Product area: `Cross-agent integration and release governance`
- Current behavior: `Auth rollout is split across multiple specialists and needs final reconciliation`
- Problem to solve: `Avoid fragmented auth behavior, broken contracts, or conversion regressions`

## 4. Scope
- In scope:
  1. Validate FE/BE contract alignment for auth endpoints and payloads.
  2. Validate verify/cookie/session lifecycle across app routes.
  3. Validate QA evidence completeness and reproducibility.
  4. Validate non-regression of anonymous recommendation funnel.
  5. Validate user-lifecycle coherence:
     - unlock-only user -> explicit register -> returning login
  6. Publish final integration decision.
- Out of scope:
  1. Building new features unrelated to auth integration closeout.

## 5. Requirements
1. Confirm all deliverables from Back-End, Front-End, and QA specialists are present.
2. Confirm API contracts match implemented client usage.
3. Confirm no P0/P1 unresolved auth defects at merge time.
4. Confirm rollout remains aligned with final-plan Phase 2 (magic-link auth only).
5. Confirm no password-based code path was introduced.
6. Return final status: `Go`, `Go with Mitigations`, or `No-Go`.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep integration actions minimal and focused.
3. Do not bypass failing checks.

## 7. Implementation Notes
1. Reconcile endpoint definitions, FE API calls, and QA evidence in one matrix.
2. Require exact references to files, tests, and command outputs.
3. Validate migration/schema compatibility for auth tables and indexes.
4. If mitigation is required, each item must have owner + timeframe.
5. Produce explicit merge order and parallel work plan for this auth release.

## 8. Test Requirements
1. Re-run critical checks (or sampled rerun) and report consistency:
   - backend lint/typecheck/test/integration
   - frontend lint/build/test/smoke
2. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Integration closeout report is complete and reproducible.
2. Final decision is evidence-backed and risk-annotated.
3. Phase 2 auth can proceed without breaking Phase 1 conversion path.
4. Register/login capability is clearly production-usable and not just partially wired.

## 10. Deliverables
1. Integration closeout report under `docs/planning/`.
2. Any minimal integration fixes needed for merge readiness.
3. Final recommendation with explicit rationale.
4. Merge order note:
   - recommended sequence for PR merge
   - what can merge in parallel vs what must wait

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. QA report is available before final integration sign-off.
- Open questions:
  1. Do we require a canary release window before full rollout?
