# TrustMeBroAI Post-Stabilization Next Phase Plan

Source of truth: `docs/planning/final-implementation-plan.md` remains authoritative until intentionally updated.

## 1. Current State
- The immediate stabilization issues have been addressed:
  - authenticated-user unlock regression
  - result-page hierarchy issue
  - crowded header navigation
  - weak mobile wizard progression controls
- Phase 2 Sprint 1 auth foundation is implemented and integration-approved:
  - `passkey-first`
  - `email` remains the account identifier
  - `email fallback / recovery` remains secondary
  - passkey registration/sign-in, recovery bootstrap, and authenticated session bootstrap are in place
- Open mitigations from the passkey foundation closeout:
  - preserve and expose `requires_passkey_enrollment` after recovery verify
  - run a real-device passkey validation sweep
- Internationalization preparation remains a Phase 2 foundation task for the next slice.

## 2. Immediate Next Goal
Move from Phase 2 Sprint 1 auth foundation to Phase 2 Sprint 2 product foundation without regressing auth stability.

This means:
1. close the two open passkey mitigations
2. implement authenticated recommendation history
3. extract English UI copy into locale resources
4. add funnel/account metrics needed to evaluate Phase 2 performance
5. keep anonymous conversion flow stable throughout

In parallel, close the ownership gap around recommendation-data architecture so research ingestion is designed intentionally instead of being improvised later.

## 3. Priority Order

### P0: Passkey Foundation Mitigation Closeout
1. Preserve and expose `requires_passkey_enrollment` after recovery verify in frontend auth state.
2. Show a guided passkey-enrollment nudge after recovery-based sign-in.
3. Run one real-device passkey validation sweep across desktop and mobile.

Exit gate:
- Passkey-first posture is preserved even when fallback recovery is used.
- Real-device passkey confidence gap is reduced.

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
1. Backend:
   - implement authenticated recommendation history API
   - add account/auth funnel event persistence and reporting inputs
2. Frontend:
   - implement authenticated recommendation history UI
   - extract active English copy into locale resources
   - preserve current English UX after extraction
   - implement post-recovery passkey-enrollment guidance using `requires_passkey_enrollment`
3. QA:
   - validate history behavior
   - validate English-parity after i18n extraction
   - complete real-device passkey sweep and verify mitigation behavior
4. Integration:
   - reconcile history contract, i18n impact, and auth non-regression before merge

Exit gate:
- English copy is externalized.
- History is usable.
- Phase 2 funnel metrics are measurable.
- Recovery-based sign-in guides users back toward passkey enrollment.

## 5. Recommended Agent Sequence
1. `Back-End Specialist` and `Front-End Specialist` can start in parallel on Sprint 2 scope once history contract boundaries are clear.
2. `QA Specialist` starts early on mitigation validation and then runs the Sprint 2 regression gate after FE/BE land.
3. `Integration Specialist` reviews Sprint 2 deliverables before merge and confirms auth remains stable.
4. `Recommendation Data Architect` runs in parallel as a design workstream and does not block Sprint 2 delivery unless it discovers a major planning contradiction.

## 6. Practical Advice
1. Do not fold broad multilingual rollout into this slice; keep it to extraction and English parity only.
2. Keep history API, history UI, and i18n extraction modular enough that failures are easy to isolate.
3. Treat the passkey mitigations as part of Sprint 2 completion, not optional polish.
4. Keep anonymous recommendation flow protected as a standing regression gate in every Phase 2 PR.
5. The internal `/tasks-progress` route may exist during development for execution visibility, but it must be deleted or disabled before go-live.
6. Keep recommendation-data design separate from advanced retrieval hype:
   - research ingestion and evaluation design belong in Phase 2
   - vector or semantic retrieval remains a later decision only if deterministic scoring becomes insufficient

## 7. Success Criteria
1. Passkey auth remains credible and modern after mitigation closeout.
2. Email fallback exists without becoming the primary auth path again.
3. Recommendation history is available to authenticated users.
4. English copy is extracted and ready for future localization.
5. Anonymous wizard conversion remains strong while accounts become more robust.

## 8A. Recommendation Data Architecture Workstream
Purpose:
1. Define how the research documents in `docs/research/` should safely feed the live `tools` dataset.
2. Define curation, normalization, conflict-resolution, and confidence rules.
3. Define recommendation-quality evaluation before any larger-scale ingestion or retrieval changes.

Owned by:
1. `Recommendation Data Architect` for design
2. `Back-End Specialist` for implementation after design approval
3. `QA Specialist` for ingestion and recommendation-quality validation

Explicit boundaries:
1. This workstream is not permission to introduce vector search immediately.
2. This workstream should not change the product promise or UI model.
3. The first outcome is architecture and evaluation design, not a broad runtime rewrite.

## 9. Current Execution Batch (2026-03-14)
1. `Back-End Specialist`
   - authenticated recommendation history API
   - account/auth funnel metrics foundation
   - recovery verify and enrollment signal hardening
2. `Front-End Specialist`
   - authenticated recommendation history UI
   - English copy extraction into translation resources
   - recovery-based passkey enrollment guidance
3. `QA Specialist`
   - real-device passkey validation sweep
   - history regression gate
   - English parity validation after i18n extraction
4. `Integration Specialist`
   - history contract reconciliation
   - anonymous-flow non-regression review
   - Sprint 2 closeout and merge gate
5. `Marketing Content Specialist`
   - current messaging audit
   - build-in-public strategy
   - copy recommendation package
6. `Recommendation Data Architect`
   - research-to-dataset ingestion architecture
   - curation and confidence rules
   - recommendation evaluation framework
   - advanced-retrieval decision checkpoint

## 10. Pre-Go-Live Internal Tooling Gate
1. `/tasks-progress` is an internal development helper only.
2. Production release is blocked until `/tasks-progress` is removed or disabled from the shipped app.
3. QA and Integration must explicitly verify this before go-live signoff.
