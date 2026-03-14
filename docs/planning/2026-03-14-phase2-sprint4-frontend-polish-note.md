# Phase 2 Sprint 4 Frontend Polish Note (2026-03-14)

## Scope Covered
1. iOS Safari post-passkey zoom mitigation.
2. `/result` transition stabilization during logged-in auto-unlock.
3. Non-regression guardrails for auth/result behavior and internal route hygiene.

## Root Cause
1. iOS Safari zoom:
- Passkey flows were launched from focused email inputs that could trigger Safari viewport zoom heuristics, and there was no targeted viewport normalization around the passkey handoff.

2. `/result` micro-blink:
- During auth bootstrap, `/result` could briefly render the locked state before authenticated auto-unlock pending/unlocked content was established.
- This created a short locked-state paint before the authenticated transition took over.

## Mitigation Implemented
1. iOS Safari zoom:
- Added iOS Safari detection and viewport normalization in passkey client flow:
  - blur focused element before/after passkey credential calls
  - run a same-position scroll normalization on animation frame
  - applies only to iOS Safari detection branch
- Raised email input font size to `text-base` in auth/unlock inputs to avoid mobile Safari auto-zoom triggers on focus.

2. `/result` micro-blink:
- Introduced bootstrap-aware pending state logic in `ResultPage` so locked content does not render while auth bootstrap is unresolved for known authenticated contexts (authenticated hint or remembered unlock marker).
- Locked subtitle is also suppressed during pending to avoid copy flicker.
- Existing remembered-session/manual fallback behavior remains intact once bootstrap resolves.

## Residual Risk
1. iOS Safari behavior still requires fresh real-device verification because WebAuthn + viewport interactions can vary by OS/Safari patch level.
2. Extremely low-latency auth bootstrap environments may still produce tiny repaint differences outside unit-test visibility, but locked-state first paint during unresolved bootstrap is now explicitly gated.

## QA Follow-Up
1. Re-run passkey login/register on real iOS Safari devices after this patch.
2. Validate `/result` transition specifically on:
- authenticated return path
- remembered session path
- anonymous unlocked path
