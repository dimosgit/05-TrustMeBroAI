## 1. Feature Title
`Phase 2 Auth Front-End Specialist: Auth Credibility Hardening`

## 2. Objective
Refine the authentication UX so `Register` and `Login` feel deliberate, trustworthy, and productized. Keep the final implementation plan intact by remaining passwordless, but remove the “just enter email and hope” feeling through stronger copy, clearer flow separation, better feedback states, and polished session behavior.

## 3. Context
- Product area: `Frontend authentication UX`
- Current behavior: `Explicit auth exists or is being introduced, but the experience risks feeling too thin and not credible enough for real users`
- Problem to solve: `Users may not trust or understand the account model if register and login are reduced to a bare email field with weak context`

## 4. Scope
- In scope:
  1. Redesign `Register`, `Login`, and `Verify` screens so they clearly communicate what the system is doing.
  2. Make `Register` and `Login` visually and semantically distinct flows.
  3. Improve signed-in state presentation so account presence is visible and believable.
  4. Add resend-link, invalid-link, and expired-link UX where supported by the back-end contract.
  5. Preserve the anonymous wizard-first flow and existing result-screen constraints.
- Out of scope:
  1. Password fields or password-reset UX.
  2. Social login.
  3. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. `Register` must explain the value of creating an account, for example saving access for later and future recommendation history.
2. `Login` must explicitly say that a secure sign-in link will be emailed.
3. The UI must clearly distinguish `unlock with email` from `create account / sign in`.
4. Success states must be explicit and calm, with next-step guidance instead of a generic spinner or dead-end screen.
5. Verification success and failure states must be polished and actionable.
6. Signed-in UI must visibly indicate account presence and allow logout.
7. If the user unlocked anonymously, the post-unlock upsell to register must feel intentional and non-blocking.
8. No extra friction may be added to the anonymous recommendation funnel.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Stay magic-link only. Do not introduce password UI.
3. Preserve the current visual language and keep the app modern, clean, and fast.
4. Do not introduce comparison tables, score displays, or flow drift.

## 7. Implementation Notes
1. Treat `Register` and `Login` as separate product moments with different copy, hierarchy, and confirmation states.
2. Add a concise explanation of why no password is required so the flow feels intentional rather than incomplete.
3. Add clear links between register and login screens.
4. Make verify screens resilient:
   - loading
   - success
   - invalid link
   - expired link
   - resend available when supported
5. Show meaningful signed-in chrome using the `auth/me` payload, not a hidden implicit state.
6. Add analytics events for register started, register requested, login requested, verify success, verify failure, resend requested, and logout.
7. Keep accessibility quality high with focus states, keyboard support, and readable inline errors.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - register page copy and validation
   - login page copy and validation
   - distinct success states for register vs login
   - verify success, invalid, expired, and resend states
   - signed-in state persistence and logout
   - non-regression of anonymous wizard and unlock flow

## 9. Acceptance Criteria
1. Register and login feel like explicit, intentional account flows rather than a bare email prompt.
2. Users can understand what happens next at every auth step without guesswork.
3. Verification failures are recoverable and not confusing.
4. Signed-in state is visible and coherent across refresh and navigation.
5. Anonymous wizard and unlock flow remain fast, clear, and visually strong.

## 10. Deliverables
1. Front-end code changes implementing auth credibility hardening.
2. Test changes proving correctness and non-regression.
3. Short implementation summary including test command results.
4. Short UX note in `docs/planning/` for QA and integration review.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Back-end provides distinct auth intents and stable verify/resend semantics.
- Open questions:
  1. Should the signed-in header show only email, or a more general `Account` label plus account menu?
