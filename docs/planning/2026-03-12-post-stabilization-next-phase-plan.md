# TrustMeBroAI Post-Stabilization Next Phase Plan

Source of truth: `docs/planning/final-implementation-plan.md` remains authoritative until intentionally updated.

## 1. Current State
- The immediate stabilization issues from earlier Phase 2 work have been addressed:
  - authenticated-user unlock regression
  - result-page hierarchy issue
  - crowded header navigation
  - weak mobile wizard progression controls
- Phase 2 Sprint 4 is complete and integration-approved:
  - first controlled candidate release has been executed
  - guarded ingestion apply path and release evidence now exist
  - FE micro-blink mitigation shipped
  - internal route hygiene remains safe by default
- Marketing execution assets are complete:
  - follow-the-build copy pack
  - 30-day content calendar
  - launch post pack
- New high-priority product decision:
  - primary recommendation unlock must require inbox ownership verification through a verification link
  - syntax and domain checks alone are not sufficient because they still allow random or mistyped emails
- Newsletter/product-update foundation now needs explicit implementation planning:
  - use verified emails as the marketing audience source of truth
  - keep subscription state and unsubscribe handling separate from auth/recovery logic
- Remaining FE/auth polish follow-up:
  - iOS Safari post-passkey viewport zoom still needs fresh real-device validation evidence

## 2. Immediate Next Goal
Move from completed Phase 2 Sprint 4 into Phase 2 Sprint 5: verified email gate and release hardening.

This means:
1. enforce verification-link ownership confirmation before primary unlock
2. keep anonymous funnel and internal route hygiene safe throughout
3. close the remaining Safari real-device validation carryover
4. retain candidate-release governance and evidence discipline
5. include newsletter subscription foundation in the main Sprint 5 execution batch

## 3. Priority Order

### P0: Verified Email Gate
1. Add verification-link request and verify steps to the recommendation unlock flow.
2. Store verification state and token lifecycle instead of trusting unverified email input.
3. Keep the primary recommendation locked until inbox ownership is confirmed.

### P0: QA and Release Hardening
1. Prove that unverified emails cannot unlock the primary recommendation.
2. Preserve anonymous wizard conversion and route safety while the new gate is added.

### P1: Safari Evidence Closeout
1. Run fresh iOS Safari real-device validation after the shipped zoom mitigation.
2. Attach evidence for passkey flow and `/result` transition behavior.

### P1: Newsletter Foundation
1. Add subscription-state and unsubscribe requirements for verified emails.
2. Keep provider sync/export behind the app database as source of truth.

## 4. Implementation Plan

### Sprint 5: Verified Email Gate and Release Hardening
1. Backend:
   - implement verification-link request/verify endpoints for recommendation unlock
   - store verification status and verification-token lifecycle
   - add newsletter subscription state and unsubscribe flow for verified emails
   - add provider sync/export path for verified subscribed emails
2. Frontend:
   - add a verification-pending unlock state
   - handle verification return and unlocked result restoration cleanly
   - update unlock copy so the verification requirement is explicit
3. QA:
   - prove unverified emails cannot unlock the primary recommendation
   - prove unverified and unsubscribed emails never receive newsletter sends
   - attach fresh Safari/device validation evidence after FE verification-gate changes
4. Integration:
   - reconcile verified-email gate safety, newsletter readiness, evidence completeness, and FE regression closure

Exit gate:
- Primary recommendation cannot be unlocked with an unverified email.
- Verification-link flow is end-to-end reliable and does not expose unlocked results early.
- Safari carryover evidence is attached or explicitly accepted with evidence.
- No regression in anonymous funnel or route hygiene.

## 5. Recommended Agent Sequence
1. `Back-End Specialist` and `Front-End Specialist` start in parallel.
2. `QA Specialist` prepares verification-gate execution and Safari evidence capture, then runs the full Sprint 5 gate after FE/BE land.
3. `Integration Specialist` closes the batch last and decides readiness for verified-email enforcement.

## 6. Practical Advice
1. Treat verified-email enforcement as a hard product requirement, not a copy tweak.
2. Preserve the curation-first, artifact-first architecture decisions already approved.
3. Do not introduce vector or semantic retrieval in this sprint.
4. Keep anonymous recommendation flow protected as a standing regression gate in every PR.
5. The internal `/tasks-progress` route must remain disabled by default and should still be removed before go-live.

## 7. Success Criteria
1. Primary unlock requires verified inbox ownership through a verification link.
2. Random or mistyped emails cannot unlock the recommendation.
3. Safari carryover evidence is attached.
4. Anonymous wizard conversion and route hygiene remain safe.

## 8A. Recommendation Data Architecture Result
Purpose:
1. Define how the research documents in `docs/research/` should safely feed the live `tools` dataset.
2. Define curation, normalization, conflict-resolution, and confidence rules.
3. Define recommendation-quality evaluation before any larger-scale ingestion or retrieval changes.

Architect outputs now available:
1. `docs/planning/2026-03-14-recommendation-data-architecture.md`
2. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
3. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`

Key decisions now locked for the next implementing agents:
1. Use a curation-first ingestion pipeline.
2. Generate staging artifacts before any DB updates.
3. Keep runtime deterministic and SQL-local.
4. Defer vector/semantic retrieval unless later triggers are met.

Explicit boundaries:
1. This workstream is not permission to introduce vector search immediately.
2. This workstream should not change the product promise or UI model.
3. The next outcome is backend and QA implementation against the approved design, not a broad runtime rewrite.

## 9. Current Execution Batch (2026-03-14)
1. `Back-End Specialist`
   - verification-link request/verify endpoints for recommendation unlock
   - verification status and token lifecycle
   - newsletter subscription state, unsubscribe flow, and provider sync/export foundation
2. `Front-End Specialist`
   - verification-pending unlock state
   - verification return flow
   - explicit verification copy
3. `QA Specialist`
   - unverified-email lock protection proof
    - verification-link flow validation
   - newsletter send eligibility proof for verified/subscribed-only users
   - fresh Safari/device validation
4. `Integration Specialist`
    - verified-email gate decision
   - newsletter readiness review
   - FE carryover review
   - Sprint 5 merge gate

Newsletter implementation note:
1. Detailed guidance is documented in `docs/planning/2026-03-14-newsletter-email-strategy.md`.
2. It stays in the normal Sprint 5 backlog, but must still remain behind the verified-email gate so newsletter sends never rely on unverified input.

## 10. Pre-Go-Live Internal Tooling Gate
1. `/tasks-progress` is an internal development helper only.
2. Production release is blocked until `/tasks-progress` is removed or disabled from the shipped app.
3. QA and Integration must explicitly verify this before go-live signoff.
