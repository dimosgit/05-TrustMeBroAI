# Follow-the-Build Copy Pack
**Date:** 2026-03-14
**Scope:** Implementation-ready copy for the follow-the-build capture surface on the landing page
**Grounded in:** `final-implementation-plan.md`, `2026-03-14-copy-recommendations.md`, `2026-03-14-build-in-public-strategy.md`

---

## Purpose

This surface captures emails from people interested in the product's journey — not users who want a recommendation right now. They are a separate audience from the unlock funnel and must be stored with `signup_source = 'follow_the_build'` to keep the two lists distinct.

---

## Placement

Below the primary CTA block on the landing page. After `No login required to start.` The surface should feel secondary — it is not competing with the wizard CTA, it is an alternative path for a different kind of visitor.

---

## Preferred Copy

### Inline label
```
Following the build?
```

### Input placeholder
```
you@example.com
```

### CTA button
```
Get updates
```

### Success state (inline, replaces the form)
```
You're in. We'll keep you posted.
```

### Error state (inline, below input)
```
Enter a valid email to subscribe.
```

### Consent note (small text below CTA, not a checkbox — this is a newsletter relationship, not a recommendation unlock)
```
Occasional updates only. No spam, no VC money, no agenda.
```

---

## Backup Variant

Use this if the preferred copy tests below a 2% capture rate after 500 landing page visits.

### Inline label
```
Want to watch this get built?
```

### Input placeholder
```
your@email.com
```

### CTA button
```
Follow along →
```

### Success state
```
Done. You'll hear from us when something worth saying happens.
```

### Consent note
```
Updates only when there's something real to share.
```

---

## Technical Notes

- Store with `signup_source = 'follow_the_build'`
- Do not require the email consent checkbox used in the unlock flow — this is a newsletter subscription, not a GDPR-gated unlock. A clear consent note below the CTA is sufficient.
- Track capture rate separately from unlock conversion rate
- Do not surface this form to users who have already submitted their email via the unlock gate in the same session
