# 1. Feature Title
`Backend Local Start Port-Collision Hardening`

## 2. Objective
Make `npm run local` deterministic and failure-safe when port `8080` is already occupied. Local startup must never present a partially running stack without an explicit actionable error. Developers should either get a healthy backend+frontend start or a clear fail-fast message that explains what is using the port and what to do next.

## 3. Context
- Product area: `Local developer experience / startup orchestration`
- Current behavior: `scripts/local-start.mjs` starts backend and frontend concurrently without backend port preflight; backend crashes with EADDRINUSE while frontend may still run on fallback port.`
- Problem to solve: `Developers can believe local mode started, but backend is not actually available, causing confusing runtime failures.`

## 4. Scope
- In scope:
  1. Harden `scripts/local-start.mjs` to detect and handle backend port collisions before spawning services.
  2. Provide clear error reporting for occupied backend port, including process identification and remediation guidance.
  3. Add automated tests for new preflight/decision logic.
- Out of scope:
  1. Changing production runtime or deployment configuration.
  2. Refactoring unrelated frontend build/dev behavior beyond what is needed for accurate local-start messaging.

## 5. Requirements
1. Before spawning backend, `local:start` must preflight `localhost:8080`.
2. If `8080` is in use:
   - Probe `http://localhost:8080/api/health`.
   - If response is TrustMeBro API health JSON (`status: ok`), treat backend as already running and do not spawn a second backend process.
   - If response is not TrustMeBro health (or probe fails), fail fast with non-zero exit and actionable diagnostics.
3. Diagnostics for non-TrustMeBro port occupancy must include:
   - port number
   - a best-effort process hint (for macOS/Linux via `lsof`/`ss` fallback)
   - next-step command hints to stop conflicting process and retry.
4. `local:start` logs must clearly state final startup mode:
   - backend spawned vs reused
   - backend URL
   - frontend URL note (including if Vite moved from `5174` to another port).
5. Prevent degraded state: if backend cannot be started or reused, do not continue as “success”.

## 6. Technical Constraints
1. Keep implementation in Node.js scripts under `scripts/` (no external npm deps for this feature).
2. Cross-platform behavior:
   - diagnostics should work on macOS/Linux; on unsupported environments, degrade gracefully with generic guidance.
3. Preserve existing `npm run local`, `local:setup`, and `local:start` entry points.

## 7. Implementation Notes
1. Primary file: `scripts/local-start.mjs`.
2. Introduce small pure helper functions (port probe, health probe, process hint formatting) to make behavior testable.
3. Use explicit exit codes and single-path shutdown logic so CI/dev shells can reliably detect failure.
4. If backend is reused, ensure user-facing output explicitly says “Reusing existing backend on :8080”.

## 8. Test Requirements
1. Add or update automated tests for all changed behavior.
2. Add script-level tests for local-start decision logic (mock port/health/process probes) to cover:
   - port free -> backend starts
   - port in use + TrustMeBro health -> backend reused
   - port in use + non-TrustMeBro -> fail-fast non-zero
3. Run relevant checks before commit:
   - Script tests: `node --test scripts/**/*.test.mjs`
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend tests: `cd backend && npm run test && npm run test:integration`
   - Frontend checks: `cd frontend && npm run lint && npm run build && npm run test`
4. Do not create a commit if any required check fails.

## 9. Acceptance Criteria
1. Running `npm run local` with a non-TrustMeBro process on `8080` exits clearly with actionable guidance and non-zero status.
2. Running `npm run local` with TrustMeBro backend already running on `8080` reuses backend and starts frontend without backend duplication.
3. Startup logs unambiguously describe effective backend/frontend endpoints and startup mode.
4. New script tests exist and pass for the three core decision paths.

## 10. Deliverables
1. Code changes implementing robust local-start backend port handling.
2. Automated tests covering new decision branches.
3. Short implementation summary with exact command outputs (pass/fail).

## 11. Mandatory Agent Rules
1. Execute all required tests before creating any commit.
2. Never commit code with failing tests.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of skipping required validation.
5. No commit on failing tests.
6. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. `http://localhost:8080/api/health` is the canonical indicator for TrustMeBro backend identity in local mode.
- Open questions:
  1. Should local-start offer an optional `--force-kill-port` mode, or remain strict fail-fast only when `8080` is occupied by another process?
