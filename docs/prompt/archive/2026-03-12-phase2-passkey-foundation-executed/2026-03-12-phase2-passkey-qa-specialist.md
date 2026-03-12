## 1. Feature Title
`Phase 2 QA Specialist: Passkey-First Auth Release Gate`

## 2. Objective
Validate the new Phase 2 passkey-first account experience end to end while protecting the anonymous recommendation funnel. The goal is to ensure the auth system is functionally correct, understandable to real users, and stable enough to support further account-based features.

## 3. Context
- Product area: `Cross-layer QA for passkey auth rollout`
- Current behavior: `The final plan now defines Phase 2 as passkey-first auth with email fallback, and the next implementation slice will introduce that account model.`
- Problem to solve: `We need evidence that passkey auth works reliably without harming the core recommendation product behavior.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`

## 4. Scope
- In scope:
  1. Validate passkey registration.
  2. Validate passkey sign-in.
  3. Validate fallback email recovery/bootstrap.
  4. Validate authenticated session bootstrap and logout.
  5. Validate non-regression of anonymous wizard and result unlock flow.
  6. Validate the credibility and clarity of the new account UX.
- Out of scope:
  1. Implementing net-new product features outside QA-owned fixes.
  2. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. QA must cover both technical correctness and user comprehension.
2. QA must test happy path and recovery/error path behavior for passkeys.
3. QA must confirm email fallback remains secondary and does not dominate the UX.
4. QA must explicitly protect the anonymous funnel from regression.
5. The final report must include `Functional Verdict` and `UX Credibility Verdict`.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Treat flaky auth behavior as a defect.
3. Do not request password/username additions as hidden scope.

## 7. Implementation Notes
1. Required manual scenarios:
   - new user register with passkey -> signed in
   - returning user sign in with passkey -> signed in
   - fallback email recovery/bootstrap
   - sign out -> anonymous state
   - anonymous user still starts wizard and unlocks result normally
2. Required error scenarios:
   - failed or cancelled passkey registration
   - failed or cancelled passkey sign-in
   - invalid or expired fallback recovery flow
3. If browser-capable or cloud QA is available, use real click-through evidence where possible.
4. Validate mobile and desktop behavior for the new auth entry points.

## 8. Test Requirements
1. Add or update automated tests for any QA-owned fixes.
2. Run relevant checks before commit:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Passkey registration and sign-in are stable and evidence-backed.
2. Fallback email recovery/bootstrap works and is clearly secondary.
3. Account session lifecycle is reliable.
4. Anonymous wizard and result unlock remain intact.
5. QA can give an explicit `Go`, `Go with Mitigations`, or `No-Go`.

## 10. Deliverables
1. A dated QA report under `docs/planning/`.
2. Any test fixes required to make the verdict trustworthy.
3. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. FE and BE will provide a standard, contract-aligned passkey flow before final QA.
- Open questions:
  1. Should lack of device/platform support for passkeys be treated as a blocker or a mitigation if fallback recovery works cleanly?
