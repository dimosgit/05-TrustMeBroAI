## 1. Feature Title
`Phase 1 Hardening Integration Specialist: Closeout and Merge Gate`

## 2. Objective
Perform final integration closeout for Phase 1 hardening and issue final merge recommendation. Ensure backend/frontend/QA outputs are consistent, complete, and aligned to final-plan exit criteria, including the research-to-seed data utilization workstream.

## 3. Context
- Product area: `Cross-agent integration and governance`
- Current behavior: `Core implementation is merged; hardening updates require final reconciliation`
- Problem to solve: `Avoid false-ready release and unresolved cross-agent drift`

## 4. Scope
- In scope:
  1. Validate cross-agent contract compatibility after hardening changes.
  2. Validate KPI evidence chain from data capture to report output.
  3. Validate quality-gate command consistency and rerun spot checks.
  4. Validate research-to-seed artifact consistency across planning doc and seed SQL.
  5. Publish integration closeout decision.
- Out of scope:
  1. New feature implementation.

## 5. Requirements
1. Confirm all Phase 1 hardening deliverables from Back-End, Front-End, and QA specialists are present.
2. Confirm no contract regressions in anonymous wizard + unlock flow.
3. Confirm KPI evidence is actionable for product decision-making.
4. Confirm unresolved P0/P1 issues are either fixed or explicitly blocked with owner + mitigation.
5. Decide final status: `Go` / `Go with Mitigations` / `No-Go`.
6. Confirm data-utilization remains Phase 1 manual curation and does not drift into Phase 2 automation scope.

## 6. Technical Constraints
1. Use final implementation plan from Git as immutable reference.
2. Keep integration actions minimal and focused.
3. Do not bypass failing checks.

## 7. Implementation Notes
1. Reconcile report claims with executable evidence and artifacts.
2. Require explicit references to command outputs and report files.
3. If KPI/perf evidence remains partial, keep `Go with Mitigations`.
4. Explicitly check `docs/planning/2026-03-10-phase1-research-to-seed-utilization.md` against `backend/db/init/002_seed.sql` and final-plan constraints.

## 8. Test Requirements
1. Re-run critical checks (or sampled rerun) and confirm consistency:
   - backend lint/typecheck/test/integration
   - backend db bootstrap/seed consistency check
   - frontend lint/build/test/smoke
2. Do not create a commit if required checks fail.

## 9. Acceptance Criteria
1. Integration closeout report is complete and reproducible.
2. Final decision is evidence-backed and risk-annotated.
3. Research-to-seed utilization decisions are integrated and validated.
4. Phase 1 can transition cleanly to Phase 2 planning/execution.

## 10. Deliverables
1. Integration closeout report under `docs/planning/`.
2. Any minimal integration fixes.
3. Final recommendation with rationale.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.
6. Do not modify `/Users/dimouzunov/00 Coding/05 TrustMeBroAI/05-TrustMeBroAI/docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Back-End, Front-End, and QA artifacts are available before integration closeout.
- Open questions:
  1. What minimum monitoring window is required before declaring stable `Go` for Phase 1?
  2. Which unresolved curation issues are acceptable under `Go with Mitigations`?
