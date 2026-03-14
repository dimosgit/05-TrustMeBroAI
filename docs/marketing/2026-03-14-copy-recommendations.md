# Copy Recommendations
**Date:** 2026-03-14
**Scope:** Landing page, unlock gate, follow-the-build capture, auth, result reveal
**Status:** Reflects current app state after 2026-03-14 session changes
**Based on:** `2026-03-14-marketing-copy-audit.md`, current `en.js`, `final-implementation-plan.md`

---

## Current State Summary

The following copy decisions from the 2026-03-13 session are already implemented:

| Surface | Status | Current copy |
|---------|--------|--------------|
| Alternatives label | ✅ Done | `These didn't make the cut for you:` |
| Locked result subtitle | ✅ Done | `Enter your email to see which tool we picked for you.` |
| Lock card subtitle | ✅ Done | `One email. Your recommendation, yours to keep.` |
| Email label | ✅ Done | `Your email` |
| Consent copy | ✅ Done | `I agree to receive product updates and AI tool recommendations by email. (It's also how we keep this free — no VC money, just your inbox.)` |
| Unlock CTA | ✅ Done | `✦ Reveal my best match` |
| Unlocked header | ✅ Done | `Your pick.` |
| Login fallback label | ✅ Done | `Signing in on a new device?` |
| Register title | ✅ Done | `Save your recommendations` |
| Register subtitle | ✅ Done | `Your device handles sign-in — no password needed. Email recovery is always there if you need it.` |
| Recovery subtitle | ✅ Done | `No passkey available right now? We'll send a secure sign-in link to your email.` |
| Account nudge | ✅ Done | `Want to come back to this later? Free account — no password needed.` |
| Footer line | ✅ Done | `Made by someone tired of AI tool comparison lists.` |

---

## Open Copy Recommendations

### Priority 1 — Follow-the-build capture (not yet built)

This surface does not exist in the app. It is required by the final implementation plan and is the most important missing copy surface before any marketing push.

**Surface:** Landing page, below or near the primary CTA

**Recommended copy:**

```
Following the build? Get updates →
[email input]
```

Or as a static line with a link if the input is not built yet:

```
Following the build? → [Subscribe for updates]
```

**Technical note:** Store with `signup_source = 'follow_the_build'`. Keep separate from unlock metrics.

---

### Priority 2 — Wizard loading subtitle

**Current:** `One moment while we process your choices.`
**Problem:** Generic. Says nothing about what is actually happening.
**Recommended:** `Matching your answers to the right tool now.`

This is a small change but it reinforces that something specific is happening, not just a spinner.

---

### Priority 3 — Locked card title (currently empty)

`result.lockCardTitle` is currently an empty string. This is fine — the card subtitle and the visual design carry the moment. No change needed unless the card feels thin in testing.

If copy is added later, keep it short and specific:
- `Your #1 match is in here.`
- `One tool. Picked for you.`

Do not add copy here unless the unlock rate data suggests the gate needs more persuasion.

---

### Priority 4 — History subtitle (low priority)

**Current:** `Your recent unlocked recommendations.`
**Problem:** Functional but has no product voice.
**Recommended:** `Tools we picked for you — saved.`

Low priority. Address in Phase 3 when returning user engagement becomes a focus.

---

## Surfaces — Keep As-Is

These are working and should not be changed without data suggesting a problem:

- Landing headline and subtitle
- Primary CTA (`Find my AI tool`)
- `No login required to start.`
- Wizard step titles
- `✦ Reveal my best match`
- `Try it →`
- Feedback UX (`Was this helpful?`)
- `Your result is ready 🎯`

---

## Experiments to Consider (Only If Unlock Rate Is Below 10%)

The final plan sets a go/no-go threshold at 10% unlock conversion after 200 wizard completions. If that threshold is missed, the following copy experiments are worth testing — in this order, one at a time:

1. **Locked header variant:** `We found your tool. One step to see it.` — more direct about the state of completion.
2. **Lock card subtitle variant:** `Free forever. Your email is the only ask.` — leans harder into the business model honesty.
3. **CTA variant:** `✦ See my match` — shorter, removes "best" which some users may distrust.

Do not run these experiments simultaneously. Change one surface at a time and measure unlock rate change over a minimum of 100 wizard completions per variant.

---

## Implementation Priority

1. Follow-the-build capture — requires frontend work, highest leverage before content push
2. Wizard loading subtitle — one line change, low risk, worth doing in current sprint
3. History subtitle — defer to Phase 3
4. Lock card title — do not add unless data suggests it is needed
