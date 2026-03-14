# Marketing Copy Audit
**Date:** 2026-03-14
**Scope:** Full English product copy vs. final implementation plan and current app state
**Source baseline:** `docs/marketing/2026-03-13-current-copy-baseline.md` + current `frontend/src/lib/i18n/locales/en.js`
**Status:** Post-session update — reflects copy changes applied 2026-03-14

---

## Summary Verdict

The core product promise is strong and the landing copy holds up well. The major copy problems from the 2026-03-13 audit have been resolved in this session. What remains are two gaps: the "follow the build" capture surface does not yet exist anywhere in the app, and the recommendation history surface is still functional-only with no product voice.

The consent copy is now the most important copy surface to get right before any marketing push, as it is the moment of maximum intent and the legal basis for the email relationship.

---

## Surface-by-Surface Audit

### Landing Page

| String | Verdict | Notes |
|--------|---------|-------|
| `There are thousands of AI tools. We tell you exactly which one to use.` | ✅ Strong | Keep. |
| `Answer 3 quick questions. Get your best match in under 60 seconds.` | ✅ Strong | Keep. |
| `Find my AI tool` | ✅ Strong | Keep. |
| `No login required to start.` | ✅ Strong | Keep. |
| *(no follow-the-build capture)* | ❌ Missing | The final plan explicitly requires a separate low-friction "follow the build" email capture on the landing page, distinct from the unlock gate. It does not exist. This is the highest-priority missing surface. |

---

### Wizard

| String | Verdict | Notes |
|--------|---------|-------|
| Step titles (`Who are you?` / `What's the mission?` / `What matters most?`) | ✅ Strong | Keep. |
| `Pick one top priority only.` | ✅ Strong | Keep. |
| `Finding your best match...` | ✅ Acceptable | Functional. Low priority to improve. |
| `One moment while we process your choices.` | ⚠️ Weak | Generic. Could acknowledge the work being done more honestly: "Matching your answers to the right tool now." |
| Loading checks (`Saving your session` / `Computing recommendation` / `Preparing result`) | ⚠️ Neutral | Functional. Not harmful. |

---

### Consent

| String | Verdict | Notes |
|--------|---------|-------|
| `I agree to receive product updates and AI tool recommendations by email. (It's also how we keep this free — no VC money, just your inbox.)` | ✅ Strong | GDPR-compliant first sentence. Parenthetical is honest and on-brand. This is now the strongest it has been. |

---

### Unlock Flow

| String | Verdict | Notes |
|--------|---------|-------|
| `✦ Reveal my best match` | ✅ Strong | Keep. |
| `Your email` | ✅ Strong | Clean, honest. Keep. |
| `Enter your email to see which tool we picked for you.` | ✅ Good | Short, direct, no gate language. Works well as the result page subtitle. |
| `One email. Your recommendation, yours to keep.` | ✅ Acceptable | Sits inside the locked card. Works as a value exchange statement. |

---

### Result Page — Locked State

| String | Verdict | Notes |
|--------|---------|-------|
| `Your result is ready 🎯` | ✅ Strong | Creates anticipation. Keep. |
| `Enter your email to see which tool we picked for you.` | ✅ Good | Now sits directly below the header. Clean. |
| Blurred preview card with `98% match` badge | ✅ Strong | Visual design change (2026-03-14). Communicates a specific hidden recommendation rather than an abstract blur. Significant UX improvement. |
| `One email. Your recommendation, yours to keep.` (lock card subtitle) | ✅ Acceptable | Functional value exchange copy. |
| `These didn't make the cut for you:` (alternatives label) | ✅ Strong | Best framing for the alternatives. Reinforces that the primary is the real answer. |
| Alternatives shown only in locked state, removed after unlock | ✅ Correct | Alternatives serve the gate mechanic only. Removing them post-unlock preserves the one-answer product promise. |

---

### Result Page — Unlocked State

| String | Verdict | Notes |
|--------|---------|-------|
| `Your pick.` | ✅ Strong | Earned, direct, personal. Good reveal moment. |
| `Try it →` | ✅ Strong | Keep. |
| `Was this helpful? 👍 Yes / 👎 Not really` | ✅ Acceptable | Lightweight. Appropriate for current phase. |
| `Want to come back to this later? Free account — no password needed.` | ✅ Strong | Real use case framing. Honest about what the account does. |

---

### Auth / Account

| String | Verdict | Notes |
|--------|---------|-------|
| `Save your recommendations` (register title) | ✅ Strong | Benefit-forward. Keep. |
| `Your device handles sign-in — no password needed. Email recovery is always there if you need it.` | ✅ Strong | Clear and reassuring. Keep. |
| `Signing in on a new device?` (login fallback) | ✅ Strong | Human language. Fixed. |
| `No passkey available right now? We'll send a secure sign-in link to your email.` (recovery subtitle) | ✅ Strong | Helpful tone. Fixed. |

---

### Recommendation History

| String | Verdict | Notes |
|--------|---------|-------|
| `Your recent unlocked recommendations.` | ⚠️ Neutral | Purely functional. No product voice. Low priority. |
| `Finish the wizard and unlock a result to start building your history.` | ✅ Acceptable | Clear guidance. Works for this phase. |

---

### App Shell / Global

| String | Verdict | Notes |
|--------|---------|-------|
| `Made by someone tired of AI tool comparison lists.` | ✅ Strong | On-brand. Specific. Keep. |
| `© 2026 TrustMeBroAI` | ✅ Neutral | Fine. |

---

## Remaining Gaps

1. **No "follow the build" capture exists.** The final plan explicitly defines this as a required separate capture surface on the landing page. It has never been built. This is the highest-priority missing piece before any marketing push.

2. **Wizard loading subtitle is generic.** `One moment while we process your choices.` could be replaced with something that signals the matching is actually happening: `Matching your answers to the right tool now.`

3. **History surface has no product voice.** Low priority for the current phase but worth addressing before any push that brings returning users back.

---

## What Is Working Well

- Landing headline and subtitle are genuinely strong.
- Consent copy is now GDPR-compliant and honest about the value exchange.
- Unlock flow copy is clean and direct.
- Auth copy no longer contains developer jargon.
- Alternatives framing correctly positions the gate without reintroducing comparison overload.
- Footer line has a distinct voice.
