## 1. Feature Title
`Phase 2 Sprint 2 QA Specialist: History, English Parity, and Real-Device Passkey Validation`

## 2. Objective
Validate the Phase 2 Sprint 2 slice with a release-gate mindset: authenticated history, English copy extraction parity, and recovery-based passkey-enrollment guidance must work without breaking the anonymous funnel. Close the real-device passkey confidence gap across desktop and mobile.

## 3. Context
- Product area: `Release gating for Sprint 2 product foundation`
- Current behavior: `Phase 2 Sprint 1 passkey foundation is complete with two open mitigations. Sprint 2 implementation now targets authenticated history, i18n groundwork, and recovery-enrollment guidance.`
- Problem to solve: `We need strong QA coverage around the new authenticated value, copy extraction, and passkey mitigation closeout before Sprint 2 can be treated as stable.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
3. `PROJECT_STATUS.md`

## 4. Scope
- In scope:
  1. Validate authenticated recommendation history behavior.
  2. Validate English-parity after i18n extraction.
  3. Validate recovery-based passkey-enrollment guidance.
  4. Run a real-device passkey validation sweep on desktop and mobile.
  5. Protect anonymous wizard/unlock flow from regression.
- Out of scope:
  1. Building production analytics dashboards.
  2. Editing `docs/planning/final-implementation-plan.md`.
  3. Broad marketing or copy strategy work.

## 5. Requirements
1. Produce a release-gate QA result for Sprint 2 with clear pass/fail findings.
2. Validate history across:
   - authenticated access
   - empty state
   - non-empty state
   - error handling
3. Validate that English copy extraction does not create visible regressions, missing strings, or broken interpolation.
4. Validate passkey and recovery behavior on real devices/browsers to the extent available.
5. Re-run anonymous wizard and unlock flow as a standing regression gate.
6. Treat `/tasks-progress` as an internal-only helper and explicitly verify it is removed or disabled before any go-live recommendation.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Prioritize reliable, reproducible findings over superficial coverage.
3. Keep findings concrete and tied to user-visible or contract-visible behavior.
4. Do not mark Sprint 2 ready if passkey fallback begins to behave like the primary auth path or if anonymous conversion flow regresses.

## 7. Implementation Notes
1. Start with a test plan before final execution so BE and FE work can be validated against a clear gate.
2. Use both automated checks and manual validation where automation is insufficient.
3. Include a real-device matrix when possible:
   - desktop browser passkey path
   - mobile browser/device path
   - recovery flow
4. Record whether copy extraction preserved:
   - visible text
   - loading/error states
   - dynamic interpolation
5. Save the QA output as a short release-gate report under `docs/planning/`.

## 8. Test Requirements
1. Run relevant checks before any QA signoff:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend unit tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
2. Add or update automated tests only if QA-owned test coverage gaps are discovered and that is the agreed fix path.
3. Do not create a commit if any required validation fails.
4. Include manual validation coverage for:
   - passkey desktop flow
   - passkey mobile flow
   - recovery verify and enrollment guidance
   - authenticated history behavior
   - anonymous funnel non-regression
   - internal `/tasks-progress` route removal or disablement before production signoff

## 9. Acceptance Criteria
1. Sprint 2 has a documented QA gate result with explicit findings or explicit signoff.
2. Real-device passkey confidence gap is addressed with recorded validation.
3. English copy extraction shows no meaningful user-visible regressions.
4. Anonymous funnel remains stable.
5. QA go-live signoff is blocked if `/tasks-progress` is still publicly shipped.

## 10. Deliverables
1. QA validation notes and a Sprint 2 release-gate report under `docs/planning/`.
2. Any QA-owned test changes if necessary and agreed.
3. Short implementation summary including exact commands executed and outcomes.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code or docs that claim signoff when checks failed.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of guessing.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. BE and FE will land Sprint 2 scope before final QA signoff.
  2. Real-device coverage may be limited by available hardware/browser access and must be stated plainly.
- Open questions:
  1. Which exact device/browser combinations are available for the real-device sweep?
