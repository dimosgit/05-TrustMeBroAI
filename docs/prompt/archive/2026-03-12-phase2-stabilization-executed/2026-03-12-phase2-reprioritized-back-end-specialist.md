## 1. Feature Title
`Back-End Specialist: P0 Unlock Contract Validation and Phase 2 Passkey Design Lock`

## 2. Objective
Stabilize the backend side of the current auth/value flow and then prepare the next auth direction properly. First, verify and, if needed, harden the remembered-user unlock contract that supports logged-in users. Second, produce the backend design lock needed for a passkey-first Phase 2 without changing the final implementation plan directly.

## 3. Context
- Product area: `Backend auth and recommendation integration`
- Current behavior: `Frontend appears to be the primary source of the logged-in unlock regression, but backend contract stability still needs confirmation before FE fixes are trusted.`
- Problem to solve: `We need confidence that the current backend unlock path works for authenticated users, and we need a clean technical path toward passkey-first auth for the next phase.`

Reference findings and planning inputs:
1. `docs/planning/2026-03-12-authenticated-user-primary-recommendation-regression.md`
2. `docs/planning/2026-03-10-post-phase1-next-action-plan.md`

## 4. Scope
- In scope:
  1. Confirm and harden the backend remembered-user unlock contract for authenticated sessions.
  2. Add or refine automated coverage for authenticated user -> unlock without re-entering email.
  3. Verify session/cookie behavior required by the FE fix.
  4. Prepare backend Phase 2 design documentation for passkey-first auth with email fallback.
  5. Identify schema, API, and infrastructure implications for passkeys.
- Out of scope:
  1. Implementing passkey runtime in this prompt.
  2. Reintroducing passwords.
  3. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. Authenticated users must be able to unlock a recommendation without supplying email again when a valid session is present.
2. Backend behavior for remembered-user unlock must be deterministic and documented.
3. Existing anonymous unlock flow must remain unchanged.
4. Produce a backend design note for passkey-first auth that assumes:
   - email remains the account identifier
   - passkey is the primary auth method
   - email fallback exists for recovery/bootstrap only
5. Do not expand scope into password or username auth.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Treat passkey work here as design lock and technical preparation, not implementation.
3. Use parameterized SQL only.
4. Do not break current recommendation, unlock, feedback, or session behavior.

## 7. Implementation Notes
1. Review and verify the current remembered-user path in `backend/src/routes/recommendationRoutes.js`.
2. If contract gaps exist, fix them with the smallest safe backend change needed for FE alignment.
3. Add explicit integration coverage for:
   - authenticated session present
   - unlock request without email
   - unlocked payload returned correctly
4. Create a short planning note under `docs/planning/` covering passkey-first backend design:
   - data model additions
   - WebAuthn registration/authentication contract shape
   - email fallback semantics
   - rollout and compatibility concerns

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd backend && npm run lint`
   - Type check: `cd backend && npm run typecheck`
   - Unit/integration tests: `cd backend && npm run test`
   - Integration tests: `cd backend && npm run test:integration`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - authenticated user unlock without email
   - anonymous unlock non-regression
   - session continuity for returning user

## 9. Acceptance Criteria
1. Backend remembered-user unlock behavior is confirmed stable and test-backed.
2. FE can safely consume the remembered-user unlock path without guesswork.
3. No regression is introduced into anonymous unlock behavior.
4. A clear backend design lock exists for passkey-first auth with email fallback.

## 10. Deliverables
1. Backend code changes if required to stabilize the remembered-user unlock contract.
2. Test changes proving correctness and non-regression.
3. A dated backend design note in `docs/planning/` for Phase 2 passkey-first auth.
4. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Frontend remains the primary fix owner for the current unlock regression.
- Open questions:
  1. Should passkey fallback email flows reuse existing auth session tables or live behind separate WebAuthn-oriented session lifecycle notes?
