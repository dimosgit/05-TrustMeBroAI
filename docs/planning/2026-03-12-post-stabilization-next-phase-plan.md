# TrustMeBroAI Post-Stabilization Next Phase Plan

Source of truth: `docs/planning/final-implementation-plan.md` remains authoritative until intentionally updated.

## 1. Current State
- The immediate stabilization issues have been addressed:
  - authenticated-user unlock regression
  - result-page hierarchy issue
  - crowded header navigation
  - weak mobile wizard progression controls
- The team has chosen the next auth direction:
  - `passkey-first`
  - `email` remains the account identifier
  - `email fallback / recovery` remains secondary
- Internationalization preparation has been identified as a Phase 2 foundation task.

## 2. Immediate Next Goal
Start Phase 2 cleanly without repeating product-plan drift.

This means:
1. align the source-of-truth plan with the passkey-first decision
2. lock the technical design before implementation
3. implement passkeys and recovery in a controlled sequence
4. keep anonymous conversion flow stable throughout

## 3. Priority Order

### P0: Source-of-Truth Alignment
1. Intentionally update the final implementation plan so Phase 2 auth reflects:
   - passkey-first auth
   - email fallback / recovery
   - no username
   - no password-first approach
2. Update the plan sections that currently still describe magic-link-only Phase 2.

Exit gate:
- Final implementation plan and next-step planning are aligned again.

### P0: Phase 2 Design Lock
1. Finalize backend passkey data model and WebAuthn flow design.
2. Finalize frontend passkey UX:
   - register with passkey
   - sign in with passkey
   - fallback email recovery
3. Finalize API contracts for:
   - registration options / verification
   - authentication options / verification
   - email fallback / recovery
   - authenticated history retrieval
4. Finalize i18n extraction approach:
   - translation key strategy
   - locale file structure
   - English source locale

Exit gate:
- Signed-off Phase 2 auth contract, UX contract, and i18n foundation approach.

## 4. Implementation Plan

### Sprint 1: Auth Foundation
1. Backend:
   - passkey registration/authentication endpoints
   - credential storage model
   - fallback email recovery/bootstrap
   - authenticated history API foundation
2. Frontend:
   - passkey registration flow
   - passkey login flow
   - fallback email recovery flow
   - authenticated session bootstrap
3. QA:
   - passkey happy path
   - recovery path
   - anonymous funnel non-regression

Exit gate:
- Returning users can register and sign in with passkeys.
- Email fallback works for recovery/bootstrap.
- Anonymous wizard flow still converts cleanly.

### Sprint 2: Product Foundation
1. Extract frontend copy into locale resources.
2. Keep English behavior visually unchanged after extraction.
3. Implement authenticated recommendation history.
4. Add phase metrics needed to evaluate:
   - unlock conversion
   - account creation
   - sign-in completion
   - try-it click-through

Exit gate:
- English copy is externalized.
- History is usable.
- Phase 2 funnel metrics are measurable.

## 5. Recommended Agent Sequence
1. `Back-End Specialist` and `Front-End Specialist` can start in parallel on design lock once the final plan is updated.
2. `QA Specialist` starts after contract lock and begins building the passkey/recovery regression matrix early.
3. `Integration Specialist` reviews after design lock, then again before merge.

## 6. Practical Advice
1. Do not start passkey implementation before the final implementation plan is intentionally updated.
2. Do not combine passkey implementation and full multilingual rollout in one giant branch.
3. Keep i18n extraction separate enough that it can be tested without auth complexity hiding regressions.
4. Keep anonymous recommendation flow protected as a standing regression gate in every Phase 2 PR.

## 7. Success Criteria
1. The plan and the implementation direction match.
2. Passkey auth feels credible and modern.
3. Email fallback exists without becoming the primary auth path again.
4. English copy is ready for future localization.
5. Anonymous wizard conversion remains strong while accounts become more robust.
