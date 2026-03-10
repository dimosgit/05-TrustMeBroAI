## 1. Feature Title
`Phase 1 Agent 2: Frontend Anonymous Wizard + Unlock UX`

## 2. Objective
Implement frontend flow exactly per `docs/planning/final-implementation-plan.md`: Landing -> Wizard -> ResultLocked -> EmailUnlock -> ResultUnlocked, with minimal cognitive load and no comparison UI. Ensure the user can start immediately without login and unlock primary recommendation via email+consent.

## 3. Context
- Product area: `Frontend SPA flow and result UX`
- Current behavior: `Frontend may still contain transitional behavior from previous auth-gated assumptions`
- Problem to solve: `Strictly enforce conversion-first UI contract and payload rendering`
- Known review findings to incorporate:
  1. Keep frontend normalization compatible with backend-native unlock payloads (`try_it_url`, nested `primary_reason`).
  2. Add/confirm frontend event tracking hooks required for Phase 1 exit metrics.

## 4. Scope
- In scope:
  1. Anonymous landing + wizard start (no login requirement).
  2. Wizard with exactly three steps: profile, task, one top priority.
  3. Locked result rendering with blurred/locked primary and exactly two alternatives.
  4. Email unlock form with explicit consent checkbox.
  5. Unlocked primary card with `Try it ->` CTA.
  6. Feedback submission UI (`thumbs_up`/`thumbs_down`).
- Out of scope:
  1. Phase 2 returning-user login.
  2. Comparison tables/scores/ranking UI.
  3. Phase 3 subscription UX.

## 5. Requirements
1. User starts wizard directly from landing.
2. Wizard submit calls session + compute endpoints and renders locked mode.
3. Locked mode shows:
   - locked primary shell only
   - two alternatives max, each with `tool_name` and optional `context_word`
4. Unlock requires valid email + consent checkbox.
5. Unlocked mode shows tool name, logo, one-sentence reason, and `Try it ->`.
6. Never render internal scoring numbers.
7. Never render more than 3 tools total.
8. CTA uses backend-provided try-it URL logic.
9. Keep responsive quality on desktop + mobile.
10. Session creation should send `wizard_duration_seconds` when available.
11. Capture try-it click tracking event after unlock using agreed backend/frontend tracking mechanism.

## 6. Technical Constraints
1. React + Vite + Tailwind only.
2. Keep modular feature structure.
3. Follow backend contract doc and final plan exactly.
4. Do not add pre-auth friction to MVP flow.
5. Do not change backend semantics directly from frontend work.

## 7. Implementation Notes
1. Keep locked/unlocked states strictly separate to avoid accidental primary leakage.
2. Normalize unlock payload to support approved backend shape variants only.
3. Keep copy concise and conversion-friendly.
4. Ensure UX error states are clear for session/compute/unlock/feedback failures.
5. Implement minimal non-disruptive instrumentation for:
   - wizard completion timing
   - unlock conversion event
   - try-it click event
6. Preserve integration-specialist fix for unlock payload shape compatibility; do not regress it.

## 8. Test Requirements
1. Add/update automated tests for all changed behavior.
2. Run checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. No login required before wizard.
2. Locked result contract is respected in UI.
3. Unlock flow works and reveals full primary card.
4. UI never shows scores or comparison-heavy content.
5. Feedback flow submits valid signals.
6. Unlocked state renders correctly for both top-level and nested reason/try-it fields from backend payload.
7. UI emits required Phase 1 KPI tracking events.

## 10. Deliverables
1. Frontend code aligned with final flow.
2. Frontend tests with passing results.
3. Short implementation summary with exact commands/results.
4. Tracking summary: where wizard duration, unlock event, and try-it click are emitted.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend contract remains aligned to final plan.
- Open questions:
  1. Whether landing “follow the build” capture is included now or as a separate scoped task.
