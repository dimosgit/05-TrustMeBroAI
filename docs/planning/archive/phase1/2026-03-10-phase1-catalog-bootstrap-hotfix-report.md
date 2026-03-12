# Phase 1 Catalog Bootstrap Hotfix Report

Date: 2026-03-10  
Scope: `2026-03-10-phase1-agent1-catalog-bootstrap-hotfix.md`

## Incident
Wizard step 1 could fail with:

`Unable to load wizard options. Please retry.`

## Reproduction (before fix)
1. Start local stack.
2. Open frontend using `http://127.0.0.1:5174`.
3. Wizard calls `GET /api/profiles`, `GET /api/tasks`, `GET /api/priorities` at `http://localhost:8080/api/...`.
4. Backend returns `200`, but response omits `Access-Control-Allow-Origin` for `Origin: http://127.0.0.1:5174`.
5. Browser blocks the response due to CORS, wizard bootstrap fails.

## Root Cause
Local/dev CORS allowlist was configured for `http://localhost:5174` only.  
When frontend origin was `http://127.0.0.1:5174`, browser-enforced CORS blocked catalog bootstrap responses.

## Fix
1. Expanded default backend local origins to include both:
   - `http://localhost:5174`
   - `http://127.0.0.1:5174`
2. Updated generated local backend env (`scripts/local-setup.mjs`) to write both origins.
3. Added non-production CORS hardening (`origin: true`) so local dev hosts such as `http://0.0.0.0:5174` are also accepted.
4. Updated example backend env to match this local-dev expectation.
5. Added integration regression test asserting CORS headers for local dev origins on catalog endpoint.

## Before/After
- Before: `Origin=http://127.0.0.1:5174` => no `Access-Control-Allow-Origin` header, wizard blocked.
- Before: `Origin=http://0.0.0.0:5174` => no `Access-Control-Allow-Origin` header, wizard blocked.
- After: local dev origins are reflected (`Access-Control-Allow-Origin: <origin>`), wizard loads options normally.
