## 1. Feature Title
`Phase 2 Sprint 5 QA Specialist: Verified Unlock Gate, Newsletter Eligibility, and Safari Evidence`

## 2. Objective
Validate the new verified-email recommendation unlock gate and the initial newsletter eligibility model, while also closing the remaining Safari real-device evidence carryover. The goal is to prove that only verified and subscribed emails are trusted for unlock/newsletter use, and that the current auth/result experience still holds up on real devices.

## 3. Context
- Product area: `QA release gate for email verification and newsletter safety`
- Current behavior: `Sprint 5 now centers on verified-email unlock enforcement, newsletter-safe email handling, and Safari evidence closure. The most important risk is accidentally allowing unlocked recommendations or newsletter eligibility from unverified or unsubscribed emails.`
- Problem to solve: `We need hard evidence that the system now rejects random email input and that newsletter lifecycle rules are enforced correctly without breaking the anonymous funnel or existing auth flows.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-newsletter-email-strategy.md`
5. Relevant backend/frontend planning notes produced during Sprint 5

## 4. Scope
- In scope:
  1. Validate recommendation unlock request/verify behavior end to end.
  2. Prove unverified emails cannot unlock the primary recommendation.
  3. Prove unverified and unsubscribed emails are excluded from newsletter eligibility.
  4. Attach fresh iOS Safari real-device evidence for passkey zoom and `/result` transition behavior.
  5. Confirm anonymous funnel and internal route hygiene remain safe.
- Out of scope:
  1. Editing `docs/planning/final-implementation-plan.md`.
  2. Broad marketing content strategy.
  3. New auth model design.

## 5. Requirements
1. QA must produce an explicit decision on whether verified-email enforcement is working correctly.
2. QA must test invalid, expired, reused, and successful verification-link paths.
3. QA must verify newsletter eligibility rules for:
   - verified subscribed users
   - unverified users
   - unsubscribed users
   - suppressed/bounced state if implemented in this slice
4. QA must re-run Safari real-device validation and attach evidence.
5. QA must keep anonymous wizard access and internal route disabled-by-default behavior in regression coverage.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Keep QA evidence reproducible and auditable.
3. Treat “email looks valid” as insufficient; inbox ownership must be the gate.
4. Block signoff if unlocked results are exposed before verification or if newsletter eligibility ignores subscription state.

## 7. Implementation Notes
1. Save the QA report under `docs/planning/`.
2. Save any evidence bundle under `docs/planning/release-evidence/` if the sprint work produces one.
3. Separate findings clearly into:
   - unlock verification gate
   - newsletter eligibility and unsubscribe behavior
   - Safari/device evidence
4. If a backend/provider sync path is only partially implemented, test exactly what exists and mark the boundary clearly.

## 8. Test Requirements
1. Run relevant validation before QA signoff:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend unit tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
2. Add or update automated tests only where QA-owned gate coverage requires it.
3. Do not create a commit if any required validation fails.
4. Include explicit validation coverage for:
   - unverified unlock blocked
   - verified unlock succeeds
   - invalid/expired/reused verification token behavior
   - unsubscribed email excluded from newsletter eligibility
   - internal route disabled-by-default behavior
   - Safari real-device passkey zoom and `/result` transition evidence

## 9. Acceptance Criteria
1. QA has a clear decision on verified-email unlock readiness.
2. QA has evidence that unverified and unsubscribed emails are not treated as eligible newsletter recipients.
3. Safari carryover evidence is attached.
4. Anonymous funnel and route hygiene remain safe.

## 10. Deliverables
1. Sprint 5 QA report under `docs/planning/`.
2. Any supporting evidence bundle under `docs/planning/release-evidence/` if needed.
3. Short implementation summary including exact commands executed and outcomes.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code or docs that claim signoff when checks failed.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of guessing.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend and frontend Sprint 5 work will land before final QA signoff.
  2. Safari real-device access remains available for the evidence pass.
- Open questions:
  1. If provider sync/export is only foundational in this slice, what exact artifact or query output should count as sufficient QA evidence?
