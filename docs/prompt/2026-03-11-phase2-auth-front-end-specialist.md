## 1. Feature Title
`Phase 2 Auth Front-End Specialist: Explicit Register + Login UX`

## 2. Objective
Add explicit `Register` and `Login` user flows so returning users can authenticate without re-entering email every time. Keep the product conversion-first UX clean and fast while introducing clear account entry points and session bootstrap.

## 3. Context
- Product area: `Frontend authentication UX and state management`
- Current behavior: `Unlock flow exists, but explicit account registration/login is not productized`
- Problem to solve: `Users lack a clear, repeatable way to register and sign in later`

## 4. Scope
- In scope:
  1. Add auth screens/routes:
     - `/register`
     - `/login`
     - `/auth/verify` (magic-link callback handling)
  2. Add top-level navigation auth affordances:
     - unauthenticated: `Register`, `Login`
     - authenticated: lightweight signed-in state + `Logout`
  3. Add clear cross-links:
     - register page links to login
     - login page links to register
  4. Add auth bootstrap on app load via `GET /api/auth/me`.
  5. Integrate backend auth endpoints for register/login request/verify/logout.
  6. Post-unlock improvement:
     - if user is anonymous after unlock, show a subtle "Create account to save and return later" callout that routes to register with prefilled email when possible
  7. Preserve anonymous wizard-first path (no pre-auth block).
  8. Keep locked/unlocked result behavior and visual quality intact.
- Out of scope:
  1. Password fields or password-reset UX.
  2. History dashboard UI.
  3. Subscription/account management UI.

## 5. Requirements
1. Register form: email + consent checkbox (explicit) + submit.
2. Login form: email only + submit.
3. Both register/login submit states must show clear "check your email" confirmation.
4. Verify route must finalize session and redirect to the intended app location.
5. Auth state must survive refresh via cookie + `auth/me` bootstrap.
6. Logout must clear state and return to unauthenticated navigation.
7. No extra friction added to anonymous recommendation funnel.
8. Existing UI copy must clearly distinguish:
   - unlock email gate (for recommendation reveal)
   - account register/login (for returning access)

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Keep visual system coherent with current UI style and components.
3. Maintain existing recommendation flow contracts and tests.
4. No password-based UX.
5. No comparison UI, no score visualizations, and no flow changes that reduce conversion-first behavior.

## 7. Implementation Notes
1. Reuse API client error model (`ApiError`, `UnauthorizedError`) for auth flows.
2. Add a small auth context/provider for session bootstrap and shared user state.
3. Keep route guards lightweight; do not block wizard entry for anonymous users.
4. Ensure verify-route handles invalid/expired tokens gracefully with actionable UI.
5. Add instrumentation events for register/login requested, verify success/failure, logout.
6. Preserve accessibility quality:
   - visible focus states
   - keyboard-submit behavior
   - inline validation and error messaging

## 8. Test Requirements
1. Add/update automated tests for all changed behavior.
2. Run before commit:
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`
   - `cd frontend && npm run test`
   - `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - register/login render and validation
   - verify route success/failure states
   - auth bootstrap on refresh
   - logout behavior
   - non-regression of anonymous wizard and unlock flow

## 9. Acceptance Criteria
1. Register + login UI flows are discoverable and functional.
2. Magic-link verification path signs user in and updates app state.
3. Auth state persists via `auth/me` bootstrap and supports logout.
4. Anonymous wizard + unlock flow remains functional and visually consistent.
5. Post-unlock register entry point is present but non-blocking.

## 10. Deliverables
1. Frontend auth UI/routes/state implementation.
2. Test updates proving auth flows and recommendation-flow non-regression.
3. Short UX note in `docs/planning/` describing auth interactions and fallback states.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Back-end contract for register/login/verify/me/logout is finalized by Back-End Specialist.
- Open questions:
  1. Should post-login redirect default to `/wizard` or last attempted protected route?
