# Marketing Copy Audit
**Date:** 2026-03-13
**Scope:** All current live English product copy vs. product strategy
**Source baseline:** `docs/marketing/2026-03-13-current-copy-baseline.md`

---

## Summary Verdict

The current copy has a strong core. The landing headline and subtitle are genuinely good — specific, confident, and low-cognitive-load. The product promise is mostly honoured in the wizard flow. However, several surfaces undermine trust or contradict the product's positioning, and one critical gap exists: there is no `follow the build` capture anywhere in the current copy, despite it being a defined direction in the implementation plan.

---

## Surface-by-Surface Audit

### Landing Page

| String | Verdict | Notes |
|--------|---------|-------|
| `There are thousands of AI tools. We tell you exactly which one to use.` | ✅ Strong | Specific, confident, positions the product as the antidote to overload. Keep. |
| `Answer 3 quick questions. Get your best match in under 60 seconds.` | ✅ Strong | Reinforces speed and low friction. Matches UX reality. Keep. |
| `Find my AI tool` | ✅ Strong | Personalised, action-oriented. Works well. |
| `No login required to start.` | ✅ Strong | Critical friction-reducer. Correctly placed. Keep. |

**Landing gap:** No `follow the build` entry point. The plan explicitly includes this as a separate capture surface. It is currently absent.

---

### Wizard

| String | Verdict | Notes |
|--------|---------|-------|
| `Who are you?` / `What's the mission?` / `What matters most?` | ✅ Strong | Conversational and on-brand. Low cognitive load. Keep. |
| `Pick one top priority only.` | ✅ Strong | Guides decision. Reinforces simplicity. |
| `Finding your best match...` | ✅ Acceptable | Functional. Not remarkable. Low priority to improve. |
| `One moment while we process your choices.` | ⚠️ Weak | Generic. Misses a small trust moment. Could acknowledge the recommendation logic briefly. |
| `Saving your session` / `Computing recommendation` / `Preparing result` | ⚠️ Neutral | Functional microcopy. Not harmful. Not memorable. |

---

### Consent

| String | Verdict | Notes |
|--------|---------|-------|
| `I agree to receive product updates and useful AI tool recommendations by email.` | ⚠️ Generic | Works legally. Doesn't sell the email relationship. Misses an opportunity to connect the email capture to the product's value loop. Could be more specific to what they'll actually receive. |

---

### Unlock Flow

| String | Verdict | Notes |
|--------|---------|-------|
| `✦ Reveal my best match` | ✅ Strong | The star glyph and action phrasing create momentum. Keep. |
| `Email to unlock` | ⚠️ Weak label | "Unlock" framing can feel transactional or manipulative. Doesn't explain what the email relationship gives them. |
| `We found your perfect AI tool` (locked result section title) | ❌ Weak | "Perfect" is generic marketing language and undersells the personalised work. "Your best match" (used elsewhere) is stronger and earned by the wizard. |
| `Enter your email below to unlock the full recommendation.` | ❌ Weak | Pure gate language. Doesn't reframe the email as a benefit. No reason to trust the ask here. |
| `One quick step to reveal it` (locked card subtitle) | ⚠️ Weak | Functional but says nothing about why they should give their email. Misses the value exchange. |

---

### Result Page

| String | Verdict | Notes |
|--------|---------|-------|
| `Your result is ready 🎯` (locked header) | ✅ Strong | Creates anticipation. Emoji works here. Keep. |
| `Your Best Match` (unlocked header) | ⚠️ Underwhelming | The moment of reveal should feel earned. "Your Best Match" is a label, not a payoff. |
| `Also consider:` (alternatives section) | ❌ Contradicts product promise | This is the most significant copy problem. The product's core promise is ONE confident recommendation. "Also consider" reintroduces the comparison overload the product is supposed to eliminate. This section heading, and potentially the entire alternatives presentation, needs re-evaluation. |
| `Want to save this? Create a free account or log in` | ⚠️ Weak | Functional but misses a value argument. "Save this" is a thin reason to create an account. |
| `Was this helpful?` feedback | ✅ Acceptable | Simple and honest. Appropriate for the phase. |

---

### Auth / Account

| String | Verdict | Notes |
|--------|---------|-------|
| `Create account with passkey` (register title) | ⚠️ Feature-forward | Leads with the mechanism, not the benefit. Most users do not know or care about passkeys. |
| `Use your device passkey for passwordless sign-in. Email recovery stays available as backup.` | ⚠️ Defensive tone | The second sentence reads as an apology for the first. Consider leading with the benefit more directly. |
| `Need account recovery or first-device bootstrap?` (login fallback) | ❌ Technical jargon | "First-device bootstrap" is not user language. This is developer language on a user-facing surface. Will confuse non-technical users. |
| `Use this only when passkey sign-in is unavailable on your current device.` (recovery subtitle) | ⚠️ Scolding tone | Reads like a warning. Users who end up here are already having friction. The tone should help, not lecture. |
| `Passkeys are not supported on this browser. Use email recovery instead.` | ✅ Acceptable | Clear and direct for an edge case. Appropriate. |

---

### Recommendation History

| String | Verdict | Notes |
|--------|---------|-------|
| `Your recent unlocked recommendations.` (subtitle) | ⚠️ Neutral | Purely functional. No product voice. Low priority. |
| `Finish the wizard and unlock a result to start building your history.` (empty state body) | ✅ Acceptable | Clear guidance. CTA is present. Works for the phase. |

---

### App Shell / Global

| String | Verdict | Notes |
|--------|---------|-------|
| `Made by real people.` | ⚠️ Vague | Intended to build trust but doesn't say what makes TrustMeBroAI different from other "real people" projects. Could be more specific to the product's honesty/confidence angle. |
| `© 2026 TrustMeBroAI` | ✅ Neutral | Fine. |
| LinkedIn footer link | ✅ Acceptable | One channel. Fine for the phase. |

---

## Critical Gaps vs. Implementation Plan

1. **No `follow the build` capture on the landing page.** The plan explicitly defines this as a separate email capture for build-in-public followers. It does not exist in any current surface.

2. **"Also consider:" section actively contradicts the product promise.** The plan defines the product as one confident recommendation. This section reintroduces comparison. It needs a product decision, not just copy work.

3. **Email capture framing treats the email as a toll, not a value exchange.** The unlock flow asks for an email to get access rather than framing the email as the start of a relationship where the user continues to receive value.

4. **Account creation has no clear value argument at the current phase.** "Save this" is the only reason surfaced. The plan may have more reasons in future (history, personalisation), but the current framing is thin.

---

## What Is Already Working

- Landing headline and subtitle are genuinely strong. Do not change them in the near term.
- "No login required to start" is a correct and important trust signal.
- The wizard step titles are conversational and on-brand.
- "✦ Reveal my best match" CTA is memorable.
- The passkey-first auth is a real differentiator, even if the copy doesn't yet sell it well.
- Feedback UX (thumbs up/down) is appropriately lightweight for the phase.

---

## Priority Issues to Address

1. **Remove or reframe "Also consider:"** — highest priority, direct contradiction of positioning.
2. **Reframe the unlock email ask** — move from gate language to value-exchange language.
3. **Add follow-the-build capture** — missing acquisition surface.
4. **Fix "first-device bootstrap"** — user-facing jargon that erodes trust.
5. **Strengthen the unlocked result reveal moment** — "Your Best Match" as a header undersells the payoff.
