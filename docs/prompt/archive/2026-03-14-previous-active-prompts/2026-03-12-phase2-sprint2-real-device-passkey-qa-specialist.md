## 1. Feature Title
`Phase 2 Sprint 2 QA Specialist: Real-Device Passkey Sweep Closeout`

## 2. Objective
Complete the pending real-device passkey validation sweep so Sprint 2 QA can move from `No-Go` to a releasable decision. The goal is to produce evidence for desktop and mobile passkey behavior across success, cancel, and retry flows. This work is evidence-first: no scope expansion, no product redesign, and no plan edits.

## 3. Context
- Product area: `QA release validation for passkey-first authentication`
- Current behavior: `Automated backend/frontend checks are passing, and Sprint 2 QA gate report exists but is blocked by missing real-device evidence.`
- Problem to solve: `The mandatory desktop/mobile real-device passkey sweep has not been documented as completed.`

Planning references:
1. `docs/planning/2026-03-12-phase2-sprint2-qa-release-gate-report.md`
2. `docs/planning/2026-03-12-phase2-passkey-qa-release-gate-report.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`

## 4. Scope
- In scope:
  1. Execute real-device passkey validation on desktop and mobile.
  2. Record evidence for register/sign-in success, cancel, and retry behaviors.
  3. Update the Sprint 2 QA gate report with findings and final release recommendation.
- Out of scope:
  1. Implementing FE or BE feature changes beyond minimal QA-owned test/report updates.
  2. Editing `docs/planning/final-implementation-plan.md`.

## 5. Requirements
1. Validate on at least one desktop browser/device and one mobile browser/device with WebAuthn passkey support.
2. For each platform (desktop, mobile), execute and document:
   - register success
   - register cancel then retry to success
   - sign-in success
   - sign-in cancel then retry to success
3. If any scenario fails or is unclear, record reproducible defect details:
   - environment, exact steps, observed result, expected result, severity.
4. Confirm whether post-recovery passkey enrollment nudge remains clear and actionable on real devices.
5. Update release decision in QA gate report to `Go`, `Go with Mitigations`, or `No-Go` based on evidence.

## 6. Technical Constraints
1. Follow `docs/planning/final-implementation-plan.md` as immutable source of truth.
2. Do not mark the gate as passed without explicit real-device evidence for both desktop and mobile.
3. Treat flaky/cancel-retry inconsistencies as defects, not acceptable noise.

## 7. Implementation Notes
1. Use available local/dev environment and real hardware where possible; if device coverage is limited, state exact limitations explicitly.
2. Capture evidence in a concise matrix format:
   - platform/browser
   - scenario
   - pass/fail
   - notes/defects
3. Update:
   - `docs/planning/2026-03-12-phase2-sprint2-qa-release-gate-report.md`
4. If defects are found, include proposed owner routing:
   - frontend UX/state issues -> FE specialist
   - API/session/credential persistence issues -> BE specialist

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
1. Real-device passkey sweep evidence exists for desktop and mobile, including cancel/retry paths.
2. Any defects are documented with reproducible steps and severity.
3. Sprint 2 QA gate report is updated with clear, evidence-backed final release decision.

## 10. Deliverables
1. Updated `docs/planning/2026-03-12-phase2-sprint2-qa-release-gate-report.md` including real-device matrix and final verdict.
2. Any QA-owned test/report updates required for trustworthy sign-off.
3. Short implementation summary including exact commands executed and pass/fail status.

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Real devices/browsers are available to execute at least one desktop and one mobile validation pass.
  2. Existing Sprint 2 implementation is the candidate build for this QA closeout.
- Open questions:
  1. Which exact desktop/mobile browser combinations should be treated as minimum release baseline for this sprint?
