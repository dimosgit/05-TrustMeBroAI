## 1. Feature Title
`Phase 2 Auth QA Specialist: Auth Credibility Release Gate`

## 2. Objective
Validate that the authentication experience is not only functional but credible to a real user. The goal is to ensure the app no longer feels like an under-specified email gate, while still respecting the final plan’s magic-link-only direction and protecting the anonymous recommendation funnel.

## 3. Context
- Product area: `Cross-layer QA for authentication UX and behavior`
- Current behavior: `Core auth may function, but the experience risks reading as incomplete or untrustworthy`
- Problem to solve: `We need evidence that register and login are understandable, secure, stable, and believable to end users`

## 4. Scope
- In scope:
  1. Validate end-to-end register, login request, verify, me, logout, and resend behaviors.
  2. Validate that register and login feel distinct and understandable in the UI.
  3. Validate error recovery for invalid link, expired link, reused link, and rate-limited actions.
  4. Validate that unlock-only users can become registered users cleanly.
  5. Validate non-regression of the anonymous wizard and result unlock funnel.
- Out of scope:
  1. Implementing net-new features outside test fixes needed for release confidence.
  2. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. QA must assess both technical correctness and user trust/clarity.
2. The final report must include `Functional Verdict` and `UX Credibility Verdict`.
3. Register and login flows must be tested with realistic user expectations, not just happy-path API checks.
4. QA must explicitly confirm that no password flow was introduced.
5. QA must identify whether the current auth experience would plausibly confuse a first-time user.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Treat flaky auth behavior as a defect.
3. Stay within magic-link auth scope and do not request password features as a hidden requirement.

## 7. Implementation Notes
1. Run at least these manual scenarios:
   - new user register -> email link -> signed in -> refresh -> logout
   - returning user login -> email link -> signed in -> run wizard
   - unlock-only user -> register -> email link -> signed in
   - invalid link -> recover
   - expired link -> resend -> recover
2. Evaluate screen copy and interaction quality, not just endpoint success.
3. Confirm the UI clearly explains why the user is being emailed and what happens next.
4. Confirm the anonymous wizard remains usable without authentication pressure.
5. If a cloud/browser QA agent is available, include click-through evidence from a real deployed environment.

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
1. Register and login are functionally correct.
2. Register and login are understandable to a first-time user without extra explanation from the team.
3. Error and recovery states are polished enough for real use.
4. Upgrade path from anonymous unlock to explicit account works cleanly.
5. Anonymous recommendation flow remains intact and fast.
6. Final QA verdict is explicit: `Go`, `Go with Mitigations`, or `No-Go`.

## 10. Deliverables
1. Dated QA report under `docs/planning/`.
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
  1. A staging or preview environment is available for realistic click-through testing.
- Open questions:
  1. Should QA treat missing resend-link UX as a release blocker or a mitigation?
