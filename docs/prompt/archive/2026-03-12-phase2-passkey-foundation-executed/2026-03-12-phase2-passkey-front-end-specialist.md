## 1. Feature Title
`Phase 2 Front-End Specialist: Passkey-First Auth UX`

## 2. Objective
Implement the frontend account experience for Phase 2 using passkey-first authentication with fallback email recovery/bootstrap. The goal is to make registration and sign-in feel modern, credible, and low-friction while preserving the app’s conversion-first anonymous flow.

## 3. Context
- Product area: `Frontend auth UX and session state`
- Current behavior: `The product has stabilized its core anonymous flow and now needs a real returning-user account experience that matches the updated final plan.`
- Problem to solve: `Users need a clear account path that feels more trustworthy than magic-link-only auth and does not clutter the core recommendation journey.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`

## 4. Scope
- In scope:
  1. Add passkey-first registration UX.
  2. Add passkey-first sign-in UX.
  3. Add fallback email recovery/bootstrap UX.
  4. Add authenticated session bootstrap and signed-in state presentation.
  5. Preserve the anonymous wizard-first path and result unlock flow.
- Out of scope:
  1. Password UI.
  2. Username UI.
  3. Full multilingual rollout beyond any minimal refactor needed for touched files.
  4. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. Register and sign-in must feel like explicit account actions, not generic email prompts.
2. Passkeys must be the primary UX path.
3. Fallback email recovery/bootstrap must be available but clearly secondary.
4. Authenticated state must be visible and coherent across refresh and navigation.
5. Header navigation must stay simple and non-crowded.
6. Anonymous users must still be able to start the wizard without auth friction.
7. Result-page and wizard UX quality must remain intact.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Do not introduce password forms or username handling.
3. Keep the UI modern, minimal, and mobile-safe.
4. Preserve no-comparison/no-score UI rules in the recommendation experience.

## 7. Implementation Notes
1. Build clear routes/screens for:
   - passkey registration
   - passkey sign-in
   - fallback email recovery/bootstrap
2. Explain the passkey action clearly so the user understands what is happening and why no password is required.
3. Keep signed-in account chrome minimal and intentional.
4. Make recovery UX explicit:
   - when to use it
   - what email is used for
   - what happens next
5. Do not let auth navigation crowd the landing or wizard experience.
6. If shared copy becomes repetitive across auth screens, structure it so later i18n extraction is easier.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - passkey registration flow
   - passkey sign-in flow
   - fallback email recovery/bootstrap flow
   - signed-in state persistence
   - logout behavior
   - anonymous wizard non-regression

## 9. Acceptance Criteria
1. Users can register and sign in through passkeys from the frontend.
2. Recovery/bootstrap email flow is available and understandable.
3. Account state is stable across refresh and route changes.
4. Anonymous recommendation flow remains fast and friction-light.
5. The UI feels intentional and modern rather than improvised.

## 10. Deliverables
1. Frontend code changes implementing passkey-first auth UX.
2. Test changes proving correctness and non-regression.
3. A short frontend UX note under `docs/planning/`.
4. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend will expose a contract suitable for standard WebAuthn browser APIs.
- Open questions:
  1. Should the primary unauthenticated header action point to `Register` or a more neutral `Account` entry screen?
