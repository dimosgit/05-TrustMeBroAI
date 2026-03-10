## 1. Feature Title
`Phase 1 Hardening Agent B: Frontend Funnel Instrumentation + Stability`

## 2. Objective
Finalize frontend Phase 1 hardening by ensuring funnel tracking signals are emitted reliably and UX remains stable. Preserve conversion-first behavior while adding measurable event hooks for wizard completion, unlock, and try-it clicks.

## 3. Context
- Product area: `Frontend event instrumentation and conversion-path stability`
- Current behavior: `Core anonymous flow works, but KPI evidence may be incomplete`
- Problem to solve: `Need reliable frontend-side event emission without regressions`

## 4. Scope
- In scope:
  1. Ensure wizard duration is captured and sent with session creation.
  2. Ensure unlock success is trackable (with agreed backend contract).
  3. Ensure try-it click event is emitted reliably from unlocked state.
  4. Add regression tests for event emission and unchanged core UX behavior.
- Out of scope:
  1. Phase 2 login/history features.
  2. New UX flows not required for Phase 1 hardening.

## 5. Requirements
1. Keep anonymous flow and locked/unlocked rendering behavior unchanged.
2. Emit wizard completion timing signal in session creation payload.
3. Emit unlock and try-it tracking signals using backend-approved endpoint/contract.
4. Ensure no additional friction is added to conversion path.
5. Preserve max 3 tools rule and no score display rule.

## 6. Technical Constraints
1. Use existing frontend stack and architecture.
2. Minimal, non-disruptive instrumentation only.
3. Keep compatibility with backend unlock payload shape variants (`try_it_url`, nested `primary_reason`).
4. No changes to final implementation plan file.

## 7. Implementation Notes
1. Instrument events where user intent is explicit and success is confirmed.
2. Avoid blocking UI on non-critical tracking calls when possible.
3. Keep fallback behavior if tracking endpoint is temporarily unavailable.
4. Add tests that verify payload fields and no-regression in user flow.

## 8. Test Requirements
1. Add/update tests for changed behavior.
2. Run before commit:
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`
   - `cd frontend && npm run test`
   - `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Funnel instrumentation events are emitted for completion/unlock/try-it.
2. Core user flow remains unchanged and passes regression tests.
3. No increase in UX friction for Phase 1 path.
4. All required frontend checks pass.

## 10. Deliverables
1. Frontend instrumentation and stability fixes.
2. Tests proving instrumentation and no-regression behavior.
3. Brief summary of where each tracked event is emitted.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend contract for tracking is available or can be finalized quickly.
- Open questions:
  1. If backend tracking endpoint returns non-200, should UI silently continue or show non-blocking toast for observability?
