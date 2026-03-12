## 1. Feature Title
`Phase 2 Sprint 2 Back-End Specialist: History API and Funnel Metrics Foundation`

## 2. Objective
Implement the backend side of Phase 2 Sprint 2 by adding authenticated recommendation history support and the data foundation for Phase 2 funnel/account metrics. Preserve the current passkey-first auth model and keep the anonymous recommendation flow stable.

## 3. Context
- Product area: `Backend product foundation after passkey auth rollout`
- Current behavior: `Passkey-first auth foundation is implemented and integration-approved. The next slice is history, metrics, and mitigation follow-through.`
- Problem to solve: `Authenticated users need usable recommendation history, and the product needs measurable account-level funnel signals for the next phase of evaluation.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
3. `docs/planning/2026-03-12-phase2-passkey-auth-api-contract.md`

## 4. Scope
- In scope:
  1. Implement authenticated recommendation history API endpoints.
  2. Add backend query and persistence support needed for history retrieval.
  3. Add phase metrics instrumentation/persistence for:
     - account creation
     - sign-in completion
     - recommendation unlock
     - try-it click-through
  4. Preserve current auth and anonymous funnel behavior.
- Out of scope:
  1. Frontend history UI.
  2. Broad analytics dashboard UI.
  3. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. Authenticated users must be able to retrieve their past recommendations safely and consistently.
2. History endpoints must not expose data across user boundaries.
3. Existing session and unlock-linked ownership semantics must remain intact.
4. Metrics added in this slice must be stable enough for later dashboard work.
5. Anonymous recommendation flow must remain unaffected.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Use parameterized SQL only.
3. Keep the history contract simple and frontend-friendly.
4. Do not expand scope into dashboard UI or unrelated auth redesign.

## 7. Implementation Notes
1. Add endpoint(s) for authenticated recommendation history retrieval.
2. Return history payloads shaped for a lightweight frontend list or detail view, not a complex analytics object.
3. Ensure recommendation ownership is based on the authenticated user-session linkage already established by the product model.
4. Add backend event persistence or structured logging inputs needed to support later funnel/account reporting.
5. Update planning/contract notes under `docs/planning/` for FE and QA consumption.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit/integration tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - authenticated user history retrieval
   - unauthorized history access rejection
   - user-isolated data access
   - metrics/event persistence behavior
   - anonymous recommendation non-regression

## 9. Acceptance Criteria
1. Authenticated users can retrieve their recommendation history.
2. History access is correctly scoped to the signed-in user.
3. Phase 2 funnel/account metrics are persisted or emitted in a consistent backend-supported way.
4. Auth and anonymous recommendation flows remain stable.

## 10. Deliverables
1. Backend code changes implementing history API and metrics foundation.
2. Test changes proving correctness and non-regression.
3. A short backend contract/update note under `docs/planning/`.
4. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Existing recommendation and user-linking data is sufficient to support a first usable history slice.
- Open questions:
  1. Should history return only unlocked recommendations initially, or all user-linked sessions with locked/unlocked state metadata?
