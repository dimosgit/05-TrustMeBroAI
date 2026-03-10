## 1. Feature Title
`Phase 1 Agent 2: Frontend Wizard + Locked Result + Email Unlock UX`

## 2. Objective
Implement the Phase 1 frontend exactly as defined in `docs/planning/final-implementation-plan.md` from Git: anonymous wizard-first flow, locked primary recommendation, and email+consent unlock. Preserve a modern, minimal UI with low cognitive load and no comparison UX. Do not introduce pre-auth login friction in MVP.

## 3. Context
- Product area: `React SPA user flow and result-gating UX`
- Current behavior: `Existing UI structure is not yet aligned to locked/unlocked conversion-first contract`
- Problem to solve: `Need exact UX states and payload handling for conversion-first MVP`

## 4. Scope
- In scope:
  1. Implement state-driven flow/screens for MVP:
     - `Landing`
     - `Wizard` (3 steps)
     - `ResultLocked`
     - `EmailUnlock`
     - `ResultUnlocked`
  2. Implement wizard behavior with exactly one selected top priority.
  3. Integrate API endpoints:
     - `GET /api/profiles`
     - `GET /api/tasks`
     - `GET /api/priorities`
     - `POST /api/recommendation/session`
     - `POST /api/recommendation/compute`
     - `POST /api/recommendation/unlock`
     - `POST /api/recommendation/:id/feedback`
  4. Implement locked primary card UX + alternative preview (2 items max, minimal fields only).
  5. Implement email unlock form with explicit consent checkbox and unlock transition.
  6. Implement primary CTA `Try it ->` behavior from unlocked payload.
  7. Add frontend tests for flow correctness and contract compliance.
- Out of scope:
  1. Login/password auth for MVP (Phase 2 only).
  2. Comparison tables, score visualizations, or multi-tool research interface.
  3. Phase 2/3 features (returning-user history, subscriptions, advanced retrieval).

## 5. Requirements
1. User must start wizard without login/account.
2. Wizard must collect exactly: profile, task, one top priority.
3. Result locked state must show:
   - primary recommendation blurred/locked
   - exactly two alternatives with `tool_name` + `context_word` only
4. Unlock requires valid email and explicit consent checkbox.
5. After unlock, UI must show full primary card with:
   - tool name + logo
   - one-sentence reason
   - `Try it ->` button
6. `Try it ->` must use `referral_url` when provided, fallback to `website`.
7. UI must never display internal scoring numbers or comparison scores.
8. UI must never render more than 3 tools total on results.
9. Include feedback action submission (`thumbs_up` / `thumbs_down`) mapped to `-1|1`.
10. Keep flow optimized for fast completion (<60s total user journey target).

## 6. Technical Constraints
1. Use existing stack: React 18 + Vite + Tailwind CSS.
2. Keep frontend modular and maintainable; avoid monolithic single-component architecture.
3. Follow backend contract doc and final Git implementation plan; do not invent alternate endpoint/UI logic.
4. Keep UI intentionally minimal: no comparison tables, no score bars, no extra cognitive-load widgets.
5. Do not modify backend implementation logic directly; coordinate contract mismatches via docs/issues.

## 7. Implementation Notes
1. Organize code into clear feature boundaries, for example:
   - `app/` (flow shell)
   - `features/wizard/`
   - `features/result/`
   - `features/unlock/`
   - `components/ui/`
   - `lib/api/`
2. Keep locked and unlocked payload rendering strictly separate to avoid accidental primary data leakage before unlock.
3. Show only one-word context for alternatives; if `context_word` is empty, show no fallback fabricated text.
4. Handle API failure states explicitly for session creation, compute, unlock, and feedback.
5. Keep interaction polish coherent across landing/wizard/result states (mobile + desktop).

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint` (add script/config if missing)
   - Type check/build: `cd frontend && npm run build`
   - Unit/integration/e2e tests: `cd frontend && npm run test` (add script if missing) and `npm run test:e2e:smoke` (add script if missing)
3. Add explicit tests for:
   - locked primary rendering before unlock
   - exactly two alternative previews
   - unlock flow with consent required
   - unlocked primary card and `Try it ->` behavior
4. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. User can complete anonymous wizard without login.
2. Locked result appears with blurred primary + two minimal alternatives only.
3. Email+consent unlock transitions to full primary card payload.
4. UI never shows score values and never renders more than 3 tools.
5. Feedback submission works for recommendation result.
6. Frontend tests validate key contract and state transitions.

## 10. Deliverables
1. Frontend code implementing Phase 1 conversion-first UX flow.
2. Test updates proving flow and contract behavior.
3. Short implementation summary with exact commands and outcomes.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not add MVP pre-auth/login screens into primary flow.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Git `docs/planning/final-implementation-plan.md` is final and authoritative.
  2. Backend returns response shapes aligned to locked/unlocked contract.
- Open questions:
  1. For landing “follow the build” capture, should frontend include form now if no dedicated endpoint is yet available?
