## 1. Feature Title
`Front-End Hardening: Unlock Button Stuck in "Unlocking..."`

## 2. Objective
Fix the unlock UX so the button never stays stuck in `Unlocking...` indefinitely on the result page. Users must always get a deterministic outcome: unlocked result or a clear recoverable error with the button re-enabled. This is a front-end reliability fix for async request handling under slow/unavailable backend conditions.

## 3. Context
- Product area: `Result page unlock flow`
- Current behavior: `On the final page, after submitting email+consent, the unlock button can remain stuck in "Unlocking..." and never recover.`
- Problem to solve: `User conversion path blocks due to non-terminating loading state when unlock request hangs or does not resolve promptly.`

## 4. Scope
- In scope:
  1. Harden frontend unlock request lifecycle with timeout/abort and guaranteed loading reset.
  2. Improve user-facing error handling for network timeout/backend unavailable conditions.
  3. Add automated tests for hanging-request and recovery behavior.
- Out of scope:
  1. Backend schema/API redesign.
  2. New product features outside unlock reliability.

## 5. Requirements
1. Unlock flow must always terminate from the UI perspective within a bounded time (no infinite loading).
2. Add request timeout for unlock API calls (recommended: 8-12 seconds, default 10 seconds) using `AbortController`.
3. On timeout/network failure:
   - `Unlocking...` must stop.
   - button must become clickable again.
   - actionable error message must be shown (e.g., `Server is unavailable. Please try again.`).
4. Ensure loading reset works for all paths:
   - manual unlock submit
   - auto-unlock attempt
   - API non-2xx response
   - aborted/timeout request
5. Keep analytics behavior unchanged for successful unlock (`recommendation_unlocked` events).

## 6. Technical Constraints
1. Implement in frontend only (`frontend/src/**`) unless absolutely required otherwise.
2. Do not change API contract fields for unlock payload.
3. Keep current visual design; only reliability/error-state behavior should change.

## 7. Implementation Notes
1. Primary files to update:
   - `frontend/src/lib/api/client.js`
   - `frontend/src/lib/api/recommendationApi.js` (if needed for timeout options)
   - `frontend/src/features/result/ResultPage.jsx`
   - `frontend/src/features/unlock/UnlockForm.jsx`
2. Add a typed/distinct timeout/network error path in API client so UI can map it to clear messaging.
3. Verify that `finally`/cleanup always clears local loading state even when request aborts.
4. Ensure auto-unlock failure does not lock manual unlock path.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Add tests covering:
   - unlock request hangs -> timeout triggers -> loading resets -> error shown
   - unlock API 5xx/network error -> loading resets -> retry possible
   - successful unlock path unchanged
3. Run relevant checks before commit:
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`
   - `cd frontend && npm run test`
   - `cd frontend && npm run test:e2e:smoke`
4. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Unlock button never remains stuck in `Unlocking...` after a failed/hung unlock attempt.
2. User gets a clear error message and can retry unlock without page refresh.
3. Existing successful unlock behavior and event tracking remain intact.
4. New automated tests exist and pass for timeout/recovery scenarios.

## 10. Deliverables
1. Frontend code changes implementing unlock loading-state hardening.
2. Test changes proving timeout and retry behavior.
3. Short implementation summary with exact test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Current stuck behavior is caused by unresolved/long-running unlock request path in FE and should be handled with client-side timeout safeguards.
- Open questions:
  1. Should timeout duration be configurable via env (e.g., `VITE_API_TIMEOUT_MS`) or hardcoded default for now?
