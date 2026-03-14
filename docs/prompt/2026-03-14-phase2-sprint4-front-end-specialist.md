## 1. Feature Title
`Phase 2 Sprint 4 Front-End Specialist: Safari Zoom and Result Transition Polish`

## 2. Objective
Close the remaining frontend auth/transition polish issues that survived Sprint 3. The goal is to remove the iOS Safari post-passkey zoom issue and eliminate the residual `/result` micro-blink during logged-in auto-unlock without regressing the stable flows that are already live.

## 3. Context
- Product area: `Frontend auth/transition polish`
- Current behavior: `Sprint 3 is complete and integration-approved with one remaining known frontend risk: iOS Safari post-passkey zoom. There is also still a deferred residual `/result` micro-blink tracked from earlier frontend notes.`
- Problem to solve: `We need to close the remaining FE polish debt before broader promotion and before treating the auth/result experience as fully stable.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-phase2-sprint3-integration-closeout-report.md`
5. `docs/planning/2026-03-14-phase2-sprint3-qa-release-gate-report.md`
6. `docs/planning/2026-03-14-phase2-sprint2-frontend-continuation-note.md`

## 4. Scope
- In scope:
  1. Fix iOS Safari post-passkey viewport zoom.
  2. Eliminate or materially reduce the residual `/result` micro-blink during logged-in auto-unlock.
  3. Preserve all currently working auth, history, landing, and unlock behavior.
- Out of scope:
  1. New feature work.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Broad landing or auth copy rewrites.

## 5. Requirements
1. iOS Safari auth completion must not leave the page visually zoomed in.
2. Logged-in auto-unlock transition on `/result` must feel stable and intentional.
3. Existing follow-the-build, history, passkey, and anonymous funnel flows must not regress.
4. `/tasks-progress` must remain disabled by default and internal-only.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Keep fixes surgical and state-driven, not hacky visual patches unless unavoidable.
3. Preserve the current UI language and layout unless a tiny targeted change is required for stability.
4. Do not regress the newly added landing follow-the-build surface.

## 7. Implementation Notes
1. Treat the Safari zoom issue as a browser/device interaction bug, not a generic styling refresh.
2. Treat the `/result` micro-blink as a transition/state sequencing issue first.
3. Add or update a short frontend planning note under `docs/planning/` documenting:
   - root cause found
   - mitigation implemented
   - any remaining residual risk
4. If a full fix is not possible in this slice, bound the issue clearly and leave reproducible evidence for QA.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior that can be covered in code.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - result auto-unlock transition behavior if code-covered
   - non-regression of landing, auth, and follow-the-build flows where touched
   - internal route remains disabled by default

## 9. Acceptance Criteria
1. iOS Safari zoom issue is fixed or clearly bounded with evidence.
2. Result auto-unlock micro-blink is fixed or materially reduced.
3. Stable flows remain stable.

## 10. Deliverables
1. Frontend code implementing the FE polish fixes.
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
  1. QA will provide fresh real-device evidence after this FE pass.
- Open questions:
  1. Is the `/result` micro-blink still reproducible consistently in local desktop browsers, or only in specific real-device/auth-return conditions?
