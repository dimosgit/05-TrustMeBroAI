# Claude (Sonnet 4.6) Suggestions: TrustMeBroAI

**Date:** 2026-03-10  
**References:** Product plan, architecture doc, Gemini suggestions, Sonnet suggestions, full codebase

---

## Overall Assessment

The plan is genuinely solid. The product idea is clear and focused, the architecture doc is unusually mature for a 40-hour MVP, and the previous AI reviewers (Gemini and Sonnet) have already caught a lot of legitimate gaps. This document avoids repeating what they said and instead adds a distinct perspective: **product strategy, prioritization realism, and the gaps between the docs and the actual code**.

---

## 1. The 40-Hour Framing Is Both an Asset and a Risk

The "Built in 40 Hours" challenge is a smart content engine. But there's a tension worth naming: the **architecture document is not a 40-hour document**. It describes a system (pgvector embeddings, Python ingestion pipelines, GitHub Actions PR gates, rollback functions, audit trails) that could take weeks to build properly.

This creates a real execution risk: you could spend 30 of those 40 hours on infrastructure and ship a product that has no users yet to benefit from it.

**Suggestion:** Treat the architecture doc as the 6-month roadmap and the product plan as the 40-hour contract. Make this split explicit in both documents. The success of the 40-hour sprint should be measured purely against the product plan's MVP success criteria (completion rate, time-to-recommendation, user-reported usefulness) — not against how much of the architecture doc got built.

---

## 2. The Recommendation Logic Is the Core Product — It Has No Spec

Both planning documents discuss *how* to store and update tools, but neither defines *how the recommendation decision actually works*. The product plan says "deterministic, rule-based or weighted scoring" — but there's no formula, no worked example, and no definition of what the weights are.

The `recommendation.js` file in the codebase has a `pickMockRecommendation()` function with a `TODO` marker. Right now, the product is entirely built around a function that doesn't exist yet.

**Suggestion:** Write a concrete scoring spec before writing any more infrastructure. Something like:

```
score = (quality_weight × quality) + (speed_weight × speed) + (ease_weight × ease_of_use) + (price_fit × pricing_match)

where weights come from the user's selected priorities.
```

Include at least one worked example: given Profile=Business, Task=Analyze PDF, Priority=Best Quality — which tools score how, and why? This is what makes the "trusted friend" feeling real. Without it, you're building a database browser, not a consultant.

---

## 3. The Auth-Before-Value Problem Is the Highest-Priority UX Risk

Gemini flagged this, and it deserves emphasis because it's the single decision most likely to kill early traction. The current flow gates the entire product behind account creation before showing any value. For a "Build-in-Public" launch where most traffic comes from social media, this will produce high bounce rates.

The fix is low-effort: let users complete the wizard and see the result without an account. Prompt for email only when they want to save or share the result. This is not an architecture change — it's a frontend routing change and a UX copy change.

**Suggestion:** Implement "recommendation first, signup optional" for the 40-hour launch. You can always add mandatory auth later. The email list is a secondary goal; the primary goal is proving the recommendation is useful.

---

## 4. The Existing Research Files Are an Underutilized Asset

The `docs/research/` directory has 10+ research files covering 100+ AI tools across categories. Most of them have structured markdown tables with exactly the fields the product needs. This is months of research that currently sits unused while the codebase has 9 hardcoded seed tools.

The architecture doc has a full plan to ingest these properly — but that plan is complex. There's a simpler path: manually curate the best 25–30 tools from those files into the `002_seed.sql` file this week. You already have the data. A one-time manual curation takes a few hours and unblocks every other product decision.

**Suggestion:** For the 40-hour MVP, replace the current 9-tool seed with a manually curated 25–30 tool seed extracted from the research files. Build the automated ingestion pipeline *after* you have real users giving feedback on whether the recommendations are useful.

---

## 5. The "Explanation" Is the Differentiator — It Has No Design

Every AI tool comparison site has a comparison table. What makes TrustMeBroAI different is the "trusted friend" explanation: plain language, specific to your task, tells you why *not* to pick the alternatives.

The product plan mentions an `explanation` field but there's no design for what it says or how it's generated. The recommendation endpoint currently returns a mock sentence.

Gemini's suggestion about "Why it's not [X]" is excellent and directly addresses this. I'd go further:

**Suggestion:** Define a template for the explanation output:

```
"For [task], we recommend [Tool] because [specific reason tied to their priority].
[Alternative 1] is also good if [condition], but [tradeoff].
[Alternative 2] is worth trying if [condition], but [limitation]."
```

This template can be filled with data from the `tools` table fields right now, without AI generation. It will feel dramatically more useful than a generic description.

---

## 6. Profile Selection May Be Adding Friction Without Adding Value

The wizard asks users to select a profile (Business, Developer, Consultant, Student) before selecting a task. But in practice, the task is probably more predictive of the right tool than the profile. A developer and a business user who both want to "analyze a PDF" will get similar recommendations.

**Suggestion:** Consider whether profile is doing real work in the recommendation logic or just adding a step. If the scoring weights are the same regardless of profile, remove it from the wizard for MVP and use it only for personalization later. Every extra question is a drop-off point.

---

## 7. The Feedback Loop Needs a Home in the Database — Right Now

Gemini flagged the missing 👍/👎 feedback. I want to add: the `feedback_dataset.csv` and `conversations_metadata_dataset.csv` files already exist in `docs/research/`. These look like they may contain actual user feedback signal. Nobody has looked at them.

**Suggestion:** Read those CSV files before designing the feedback schema. They might already tell you what signal matters. At minimum, add a `user_feedback` table to the schema before launch:

```sql
CREATE TABLE user_feedback (
  id SERIAL PRIMARY KEY,
  recommendation_id INTEGER REFERENCES recommendations(id),
  signal SMALLINT CHECK (signal IN (-1, 1)), -- thumbs down / up
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

This costs almost nothing to add and will be invaluable data within the first week.

---

## 8. The "Build-in-Public" Distribution Plan Needs One More Element

The distribution plan covers LinkedIn, X/Twitter, and YouTube Shorts. The video format is well-defined. One missing element: **a place to send people that captures them**.

Social traffic is ephemeral. A post gets 48 hours of visibility and then disappears. The plan has email signup via the product itself, which is the right instinct — but the landing page and signup flow need to be optimized for this specific traffic pattern: someone who watched a 30-second video and is mildly curious.

**Suggestion:** Add a simple "follow the build" email capture on the landing page that is separate from the product wizard. Something like: "We're building this live. Enter your email to follow along and get notified when it's live." This captures people who aren't ready to use the product yet but are interested in the journey.

---

## 9. Deployment Readiness Gap

The README has solid Coolify deployment notes and the Docker setup looks clean. One gap: there's no mention of a database backup strategy before any real users are added. The architecture doc has a nightly backup workflow planned, but it's part of Phase 3.

**Suggestion:** Before promoting the product publicly, add a simple pg_dump cron job or Coolify scheduled task. Even if it's basic, losing early user data (sessions, recommendations, feedback) would be a painful setback.

---

## 10. What the Previous AI Reviewers Got Right That Bears Repeating

Without duplicating their full analysis, these items from Gemini and Sonnet should be treated as **hard requirements before launch**, not nice-to-haves:

- **Gemini:** Move auth gate to after the recommendation. Mobile-optimized comparison view (cards, not tables). Add `referral_url` field to schema now.
- **Sonnet:** Define `tool_slug` derivation rule before writing any ingest code. Add input validation to `POST /api/session` and `POST /api/recommendation`. The `postgres:18-alpine` image tag in `docker-compose.yml` is potentially unstable — check it.

---

## Priority Stack-Rank for the 40-Hour Sprint

| Priority | Item | Reason |
|---|---|---|
| 1 | Write the scoring formula spec | Nothing else in the product works without it |
| 2 | Move auth gate to post-recommendation | Highest impact on conversion |
| 3 | Expand seed data to 25–30 tools manually | Product needs real data to feel real |
| 4 | Design the explanation template | This is the differentiator |
| 5 | Add `user_feedback` table | Cheap to add now, expensive to retrofit |
| 6 | Add rate limiting to recommendation endpoint | Security baseline before going public |
| 7 | Mobile-optimized result view (cards not table) | Social traffic is mobile-first |
| Defer | Python ingestion pipeline | Post-MVP; manual seed is sufficient for launch |
| Defer | pgvector / semantic retrieval | Post-MVP; no evidence structured scoring is insufficient |
| Defer | GitHub Actions PR-gate workflows | Post-MVP; no concurrent team requiring CI gates yet |
