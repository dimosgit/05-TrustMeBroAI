## 1. Feature Title
`Phase 1 Hardening Agent A: Backend KPI + Performance Closeout`

## 2. Objective
Complete Phase 1 closeout hardening by making KPI evidence and performance evidence explicit and queryable, without changing product behavior. Ensure backend can prove wizard completion timing, unlock conversion, and try-it click-through, and provide reproducible compute latency evidence for p95 target.

## 3. Context
- Product area: `Backend instrumentation, data integrity, and performance verification`
- Current behavior: `Core flow works, but release confidence depends on measurable KPI/performance evidence`
- Problem to solve: `Need operational proof for Phase 1 exit criteria`

## 4. Scope
- In scope:
  1. Ensure backend persists/derives data for:
     - wizard completion timing
     - unlock conversion
     - try-it click-through
  2. Validate unlock integrity checks (`session_id` + `recommendation_id` consistency).
  3. Add reproducible compute-latency measurement method and report script/notes.
  4. Add/extend integration tests for instrumentation and integrity paths.
- Out of scope:
  1. Phase 2 features (magic link, user history UX).
  2. Product UI redesign.

## 5. Requirements
1. `wizard_duration_seconds` must be accepted, validated, and persisted for session creation.
2. Unlock flow must enforce session/recommendation integrity and reject mismatches.
3. Try-it clicks must be trackable in a durable backend record (or equivalent explicitly documented source of truth).
4. Produce a lightweight backend query/report artifact showing:
   - completion timing sample
   - unlock conversion numerator/denominator
   - try-it CTR numerator/denominator
5. Compute endpoint p95 validation method must be documented and executable.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep instrumentation minimal and non-breaking.
3. Parameterized SQL only.
4. No pre-auth/login gating introduced in MVP.

## 7. Implementation Notes
1. Prefer reuse of existing entities where possible; add minimal table/field only if needed for reliable measurement.
2. If adding a click endpoint/event persistence, keep contract simple and deterministic.
3. Add clear SQL/query snippets for KPI extraction in docs/planning closeout report.
4. Ensure unlock integrity checks are covered with explicit negative tests.

## 8. Test Requirements
1. Add/update tests for changed behavior.
2. Run before commit:
   - `cd backend && npm run lint`
   - `cd backend && npm run typecheck`
   - `cd backend && npm run test`
   - `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. KPI data for Phase 1 exit criteria is queryable and documented.
2. Unlock integrity validation is enforced and tested.
3. Compute p95 measurement procedure is documented and reproducible.
4. All required backend checks pass.

## 10. Deliverables
1. Backend instrumentation/integrity code changes.
2. Tests proving correctness.
3. Short KPI/performance evidence note (query examples + command outputs).

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Core Phase 1 flow is already functional in integration.
- Open questions:
  1. If try-it tracking does not yet exist, should the event be recorded synchronously or via fire-and-forget endpoint semantics?
