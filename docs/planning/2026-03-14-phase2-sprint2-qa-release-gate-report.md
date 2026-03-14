# Phase 2 Sprint 2 QA Release Gate Report (2026-03-14)

## Risk Summary
- Risk tier: `High` (auth + history + i18n extraction + conversion funnel + internal-route exposure).
- Scope validated in this gate:
1. Authenticated recommendation history behavior (auth/empty/loading/non-empty/error).
2. English parity after i18n extraction, including interpolation-sensitive copy.
3. Recovery-based passkey enrollment guidance behavior.
4. Real-device passkey validation on desktop and mobile.
5. Anonymous wizard/unlock non-regression.
6. Internal `/tasks-progress` exposure check for go-live readiness.

Assumptions:
1. The current workspace implementation is the Sprint 2 candidate.
2. Real-device matrix evidence supplied during QA execution reflects actual manual validation sessions.

Untested areas:
1. Broader device/browser combinations beyond Chrome Desktop and Safari iPhone 14 Pro Max.
2. Full manual recovery-link verification on real devices was not re-run in this exact session; automated coverage is present.

Plan immutability check:
1. `docs/planning/final-implementation-plan.md` was not modified.

## Test Plan
1. Execute full required command matrix across backend and frontend.
2. Validate history scenarios with automated evidence:
   - authenticated access and unauthenticated redirect path
   - empty state
   - loading state
   - non-empty state + open-result action
   - error + retry handling
3. Validate English parity/interpolation via frontend tests against extracted locale strings.
4. Validate recovery-based passkey enrollment guidance.
5. Validate real-device passkey behavior matrix (desktop and mobile success/cancel/retry paths).
6. Validate anonymous funnel stability.
7. Validate whether `/tasks-progress` is removed/disabled for go-live.

## Execution Results
### Required Command Matrix
1. `cd backend && npm run lint` -> `PASS`
2. `cd backend && npm run typecheck` -> `PASS`
3. `cd backend && npm run test` -> `PASS` (`10/10`)
4. `cd backend && npm run test:integration` -> `PASS` (`29/29`)
5. `cd frontend && npm run lint` -> `PASS`
6. `cd frontend && npm run build` -> `PASS`
7. `cd frontend && npm run test` -> `PASS` (`44/44`)
8. `cd frontend && npm run test:e2e:smoke` -> `PASS` (`1/1`)

### Requirement Evidence Mapping
1. Authenticated history behavior -> `PASS`
   - Evidence: `frontend/src/test/auth-phase2-sprint2.test.jsx` covers unauthenticated prompt, empty state, loading state, non-empty state, and error/retry.
   - Evidence: `backend/test/integration/history-metrics.test.js` covers auth requirements, user scope, and isolation.
2. English parity and interpolation after extraction -> `PASS`
   - Evidence: `frontend/src/test/auth-phase2-sprint2.test.jsx` (English parity assertion and rendered context text `Developer · Write code`).
   - Evidence: `frontend/src/lib/i18n/locales/en.js` and `frontend/src/features/history/HistoryPage.jsx` interpolation path `history.contextLabel`.
3. Recovery-based passkey enrollment guidance -> `PASS`
   - Evidence: `frontend/src/test/auth-phase2-sprint2.test.jsx` validates nudge render and dismiss behavior after recovery verify.
   - Evidence: backend integration includes `requires_passkey_enrollment` handling.
4. Real-device passkey sweep -> `PASS`
   - Desktop Chrome:
     - `D1` register success -> `PASS`
     - `D2` register cancel/retry -> `PASS`
     - `D3` sign-in success -> `PASS`
     - `D4` sign-in cancel/retry -> `PASS`
   - Mobile Safari (iPhone 14 Pro Max):
     - `M1` register success -> `PASS`
     - `M2` register cancel/retry -> `PASS`
     - `M3` sign-in success -> `PASS`
     - `M4` sign-in cancel/retry -> `PASS`
5. Anonymous funnel non-regression -> `PASS`
   - Evidence: backend integration `anonymous recommendation flow still works without auth`.
   - Evidence: frontend smoke + auth-gating suites pass.
6. `/tasks-progress` internal-route check -> `FAIL` for go-live readiness
   - Evidence: `frontend/src/app/AppRoutes.jsx` still exposes `/tasks-progress`.
   - Evidence: `frontend/src/test/tasks-progress.test.jsx` confirms route renders publicly.
   - Impact: explicitly blocks go-live recommendation until removed/disabled.

### Open Findings
1. `[Open][P1][Go-live blocker]` `/tasks-progress` is still publicly routable.
   - Owner: FE Specialist
   - Action: remove route from public router or hard-disable outside dev-only guard before release.
2. `[Open][P3][Non-blocking]` iOS Safari viewport appears zoomed-in after passkey sign-in.
   - Environment: iPhone 14 Pro Max Safari via ngrok.
   - Owner: FE Specialist
   - Action: fix viewport stability after auth return.

## Release Decision
1. Sprint 2 integration gate: `Go with Mitigations`.
   - Reason: functional requirements and command matrix are green; real-device passkey matrix is complete.
2. Go-live recommendation: `No-Go` until `/tasks-progress` is removed/disabled.
   - Reason: explicit requirement that internal helper route must not ship publicly.
3. Non-blocking mitigation to track after integration:
   - iOS Safari post-passkey zoom regression.
