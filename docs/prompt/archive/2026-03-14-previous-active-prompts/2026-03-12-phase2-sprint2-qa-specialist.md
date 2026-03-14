## 1. Feature Title
`Phase 2 Sprint 2 QA Specialist: History, I18n, and Passkey-Mitigation Gate`

## 2. Objective
Validate Phase 2 Sprint 2 by checking authenticated history, English copy extraction parity, and the remaining passkey mitigations. The goal is to confirm the account experience is getting more useful without regressing auth stability or the anonymous conversion funnel.

## 3. Context
- Product area: `Cross-layer QA for Sprint 2 product foundation`
- Current behavior: `Passkey-first auth foundation is implemented and approved with mitigations. Sprint 2 adds product value and closes those mitigations.`
- Problem to solve: `We need evidence that history and i18n extraction work correctly and that passkey-first posture remains credible after recovery-based sign-in.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
3. `docs/planning/2026-03-12-phase2-passkey-qa-release-gate-report.md`

## 4. Scope
- In scope:
  1. Validate authenticated recommendation history behavior.
  2. Validate English copy parity after i18n extraction.
  3. Validate post-recovery passkey enrollment nudge behavior.
  4. Execute the pending real-device passkey validation sweep.
  5. Validate anonymous flow non-regression.
- Out of scope:
  1. Implementing net-new product features outside QA-owned fixes.
  2. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. QA must cover both functional correctness and UX clarity.
2. English copy extraction must be tested as parity work, not assumed safe.
3. The real-device passkey sweep must be completed and documented.
4. QA must confirm the recovery flow no longer weakens passkey-first posture.
5. Anonymous wizard and unlock must remain stable.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Treat flaky auth/history behavior as a defect.
3. Keep the QA gate focused on Sprint 2 scope and known mitigations.

## 7. Implementation Notes
1. Required manual scenarios:
   - authenticated user sees history entries
   - authenticated user with no history sees clean empty state
   - recovery verify requiring passkey enrollment shows a clear nudge
   - English copy still renders correctly across touched screens after extraction
   - anonymous user still completes wizard and unlocks result normally
2. Real-device sweep must cover:
   - desktop passkey register/sign-in cancel/retry
   - mobile passkey register/sign-in cancel/retry
3. If a cloud/browser QA setup is available, use it for click-through evidence where helpful.

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
1. History behavior is stable and evidence-backed.
2. English copy parity is preserved after extraction.
3. Real-device passkey mitigation is closed with documented evidence.
4. Recovery-based sign-in now supports passkey-first posture through guided enrollment.
5. Anonymous flow remains intact.

## 10. Deliverables
1. A dated QA report under `docs/planning/`.
2. Any QA-owned fixes needed to make the verdict trustworthy.
3. Short implementation summary including test command results.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. FE and BE will land Sprint 2 scope before final QA closeout.
- Open questions:
  1. If English parity is functionally correct but a few extracted strings regress visually, should that be a blocker or mitigation?
