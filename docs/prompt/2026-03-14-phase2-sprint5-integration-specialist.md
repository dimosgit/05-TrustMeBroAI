## 1. Feature Title
`Phase 2 Sprint 5 Integration Specialist: Verified Email Gate and Newsletter Readiness Closeout`

## 2. Objective
Drive the final integration review for Sprint 5, focusing on verified-email-only unlock enforcement, newsletter-readiness foundations, and the remaining Safari evidence carryover. The goal is to make sure the product only trusts owned inboxes, does not leak marketing eligibility to the wrong users, and preserves the stable core flow.

## 3. Context
- Product area: `Integration closeout for unlock trust, newsletter readiness, and UX stability`
- Current behavior: `Sprint 5 introduces a stricter unlock gate and folds newsletter lifecycle foundation into the same execution batch. This creates cross-cutting risk across backend contracts, frontend flow states, QA evidence, and release readiness.`
- Problem to solve: `We need a single final readiness decision that reconciles verified-email enforcement, newsletter eligibility rules, Safari evidence, and anonymous funnel safety.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-newsletter-email-strategy.md`
5. Sprint 5 BE/FE/QA notes and reports under `docs/planning/`

## 4. Scope
- In scope:
  1. Review backend and frontend implementation against the verified-email unlock requirement.
  2. Review newsletter subscription/unsubscribe readiness and provider eligibility boundaries.
  3. Review Safari carryover evidence and remaining UX risk.
  4. Produce the Sprint 5 closeout decision.
- Out of scope:
  1. Editing `docs/planning/final-implementation-plan.md`.
  2. New feature ideation beyond Sprint 5 closeout.
  3. Marketing campaign strategy changes.

## 5. Requirements
1. Produce a clear `Go`, `Go with known risks`, or `No-Go` decision for Sprint 5.
2. Block approval if unverified emails can still unlock recommendations.
3. Block approval if newsletter eligibility or unsubscribe handling violates the documented rules.
4. Confirm Safari carryover evidence exists or is explicitly accepted as a bounded risk.
5. Confirm `/tasks-progress` remains disabled by default and still tracked as pre-go-live cleanup.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Treat evidence completeness as part of readiness, not optional documentation.
3. Prefer explicit escalation over silent acceptance of ambiguous behavior.
4. Keep Sprint 5 closeout focused; do not let it drift into unrelated Phase 3 work.

## 7. Implementation Notes
1. Review BE unlock verification and newsletter lifecycle outputs first.
2. Review FE pending/return messaging and QA evidence second.
3. Save the final integration closeout report under `docs/planning/`.
4. If Sprint 5 is complete, prepare the next handoff from actual remaining work only.

## 8. Test Requirements
1. Re-run relevant validation as needed before final signoff:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend unit tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
2. Do not create a commit if any required validation fails.
3. Confirm evidence exists for:
   - unlock verification request/verify behavior
   - blocked unverified unlocks
   - newsletter eligibility and unsubscribe rules
   - Safari carryover validation
   - anonymous funnel non-regression
   - internal route disabled-by-default behavior

## 9. Acceptance Criteria
1. Sprint 5 has a clear integration closeout decision.
2. Verified-email unlock enforcement has evidence, not just assertions.
3. Newsletter readiness boundaries are explicit and safe.
4. Remaining UX risk is either closed or accepted with evidence.

## 10. Deliverables
1. Sprint 5 integration closeout report under `docs/planning/`.
2. Any minimal integration fixes required for readiness.
3. Short implementation summary including exact commands executed and outcomes.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of hiding them.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. QA will produce explicit evidence for unlock verification, newsletter eligibility, and Safari validation.
- Open questions:
  1. What is the minimum acceptable provider sync/export implementation that still qualifies as Sprint 5 newsletter readiness?
