## 1. Feature Title
`Phase 2 Sprint 5 Front-End Specialist: Verified Unlock UX and Newsletter Verification Messaging`

## 2. Objective
Implement the frontend experience for the new verified-email gate so users clearly understand that recommendation unlock now requires clicking a verification link. The goal is to keep the flow credible and clear while also updating follow-the-build/newsletter messaging so the product no longer implies immediate subscription success before verification.

## 3. Context
- Product area: `Unlock UX, verification return flow, and email-subscription messaging`
- Current behavior: `The plan now requires verification-link-based unlock, but the frontend still needs a verification-pending state, verification-return handling, and updated copy across unlock and follow-the-build surfaces.`
- Problem to solve: `Without frontend changes, users will not understand why the recommendation remains locked after email submission, and follow-the-build/newsletter capture may still imply success before verification.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-newsletter-email-strategy.md`
5. Existing unlock/result flow in `frontend/src/features/result/` and `frontend/src/features/unlock/`
6. Existing follow-the-build UI in `frontend/src/features/landing/`

## 4. Scope
- In scope:
  1. Add verification-pending UX for recommendation unlock.
  2. Handle verification-return flow cleanly and unlock the recommendation only after successful verification.
  3. Update unlock and follow-the-build/newsletter copy so verification is explicit.
  4. Preserve the current anonymous wizard, auth, and history flows.
- Out of scope:
  1. Editing `docs/planning/final-implementation-plan.md`.
  2. Rewriting the broader landing page design.
  3. Password auth or unrelated account model changes.
  4. Backend contract design beyond consuming the agreed API.

## 5. Requirements
1. After email submission for unlock, the UI must clearly move into a `check your email` / `verification pending` state instead of implying immediate unlock.
2. The frontend must handle verification-return state so the primary recommendation only becomes visible after the backend confirms verification.
3. Unlock copy must clearly explain that inbox ownership verification is required.
4. Follow-the-build/newsletter UI must describe the flow as verification-first, not immediate enrollment.
5. Existing logged-in, anonymous, and passkey flows must not regress.
6. `/tasks-progress` must remain disabled by default and internal-only.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Keep the unlock state transition state-driven and avoid brittle client-only shortcuts.
3. Preserve the current visual style and tone unless a targeted UX change is necessary for clarity.
4. Maintain accessibility for new pending/success/error states.

## 7. Implementation Notes
1. Treat unlock verification and follow-the-build verification as related messaging problems, but do not couple them into a single user flow.
2. Make the recommendation-unlock pending state feel intentional, not like an error or loading bug.
3. Reuse shared verification/pending components where sensible, but keep the unlock journey primary.
4. Update i18n resources together with the feature so English remains fully externalized.
5. If backend contract details differ from the plan, align to the implemented backend contract and document the frontend assumptions in a short note under `docs/planning/`.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Run relevant checks before commit:
   - Lint: `cd frontend && npm run lint`
   - Build: `cd frontend && npm run build`
   - Tests: `cd frontend && npm run test`
   - Smoke tests: `cd frontend && npm run test:e2e:smoke`
3. Do not create a commit if any required check fails.
4. Include tests for:
   - unlock enters verification-pending state after request
   - unlocked result is shown only after verification succeeds
   - follow-the-build UI reflects verification-required messaging
   - non-regression of passkey auth, history, landing, and internal-route gating where touched

## 9. Acceptance Criteria
1. Recommendation unlock no longer appears immediate after email entry.
2. Verification-pending and verification-return states are clear and polished.
3. Follow-the-build/newsletter messaging no longer implies unverified signup success.
4. Existing stable flows remain stable.

## 10. Deliverables
1. Frontend code implementing the verified unlock UX and newsletter-verification messaging changes.
2. Test changes proving correctness and non-regression.
3. Short frontend planning note under `docs/planning/` if assumptions or edge-case handling need documentation.
4. Short implementation summary including exact test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend will expose request/verify endpoints or an equivalent contract that cleanly distinguishes pending and verified states.
  2. The landing follow-the-build capture should remain lightweight, but must be truthful about verification.
- Open questions:
  1. Should the unlock verification-return land directly on `/result`, or route through a dedicated confirmation screen before showing the unlocked result?
