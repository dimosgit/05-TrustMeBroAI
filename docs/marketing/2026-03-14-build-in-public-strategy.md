# Build-in-Public Strategy
**Date:** 2026-03-14
**Scope:** Realistic build-in-public plan for TrustMeBroAI at current phase
**Grounded in:** `docs/planning/final-implementation-plan.md`, `PROJECT_STATUS.md`

---

## Situation Assessment

TrustMeBroAI is a working product. Phase 1 is complete. Phase 2 Sprint 1 is complete. The anonymous funnel works: landing → wizard → locked result → email unlock. Passkey auth is live. History is in progress.

This is a good moment to start building in public — the product is real, the flow is complete, and there is genuine engineering work happening that is worth talking about.

The risk is drifting into generic "building an AI tool" content that has no signal, no credibility, and no audience. The strategy below avoids that by staying close to what is actually true about the product.

---

## Core Positioning for Build-in-Public Content

One sentence: **TrustMeBroAI answers one question — which AI tool should I actually use — and answers it in under 60 seconds without making you read a comparison table.**

Every piece of build-in-public content should connect back to this. The product's differentiator is not the AI, the recommendation engine, or the tech stack. It is the decision to give one confident answer instead of a ranked list.

---

## Audience Priority

### Primary: AI-curious professionals who are already overwhelmed

- Business professionals, consultants, founders, students who use or want to use AI tools
- Pain: they see AI tool recommendations everywhere but still don't know what to actually use
- They are the product's target user — content should be written for them first

### Secondary: Indie developers and builders

- Developers who are themselves building products
- They respect honest product updates, real conversion numbers, and decisions made in the open
- They are a credibility audience — they validate the product to the primary audience

### Not a priority yet: SEO, broad tech Twitter, press

- These channels require volume and consistency that a small team cannot sustain at this phase
- Prioritise them in Phase 3 when the product has more data and a track record

---

## Channel Plan

### LinkedIn — Primary channel

**Why:** The target user (business professional, consultant, founder) is on LinkedIn. The product is directly relevant to their daily work tool decisions.

**Content rhythm:** 2–3 posts per week. Short, direct, no filler.

**Content types:**
- Product milestone updates (what shipped, why it matters)
- One real number per post where possible (unlocks, wizard completions, feedback signal)
- Short takes on AI tool overload — the product's core problem
- Behind-the-build posts: one real decision explained honestly

**What to avoid:** Motivational content, generic "AI is changing everything" takes, posting product screenshots without context.

---

### Twitter/X — Secondary channel

**Why:** Developer and indie builder audience. Useful for credibility and cross-pollination.

**Content rhythm:** 1–2 posts per week, or mirrors of LinkedIn content adapted for shorter format.

**Content types:**
- Technical decisions made honestly (why passkey-first, why one answer not a list)
- Short product updates
- Observations from the data once enough unlocks exist

---

### Reddit — Targeted, not volume

**Why:** Genuine communities where the product's core problem is actively discussed.

**Target communities:** r/artificial, r/ChatGPT, r/productivity, r/SideProject, r/Entrepreneur

**Rules:**
- Only post when genuinely contributing to an existing conversation
- Never lead with the product link — lead with the answer, mention the product only if relevant
- One launch post in r/SideProject when a significant milestone is reached (first 100 unlocks, first 500 wizard completions)

**Reference:** `docs/marketing/2026-03-13-reddit-playbook.md` for detailed community approach.

---

## Content Themes

These are the five honest things worth talking about publicly. Each maps to real product decisions in the final plan.

### 1. The one-answer decision

The product made a deliberate choice to give one answer, not a ranked list. This is worth explaining. Most comparison tools give more — TrustMeBroAI gives less on purpose. This is the core positioning argument and it is genuinely interesting to the target audience.

**Example content angle:** "We removed the comparison table. Here is why."

---

### 2. Email as honest business model

The product is free. Email is the value exchange. The consent copy explains this now. The build-in-public story around this is: we are building a free tool and the deal is your email. No VC money, no ads, no upsell trap. This is an honest and increasingly rare product model.

**Example content angle:** "The product is free. Here is how that actually works."

---

### 3. Real conversion numbers (when available)

The final plan sets a target of 20% unlock conversion from wizard completions. Once enough data exists (suggested threshold: 200 wizard completions), posting the real number — whatever it is — will be more credible than any product description.

**Example content angle:** "X people completed the wizard this month. Y unlocked the recommendation. Here is what we learned."

---

### 4. Building with constraints

The product is built by a small team. The decisions made under constraints (deterministic scoring over ML, passkey-first auth, no comparison UI) are worth explaining. Builders and developers respond well to honest constraint-driven decisions.

**Example content angle:** "Why we use deterministic scoring instead of an LLM for recommendations."

---

### 5. The AI tool landscape problem

The product exists because the AI tool landscape is overwhelming. Content that documents this problem — not as marketing but as honest observation — positions the product correctly and provides value to the audience before they ever use it.

**Example content angle:** "There are now 12,000+ AI tools listed on various directories. Here is the only question that matters."

---

## The Follow-the-Build Capture

The final plan requires a separate "follow the build" email capture on the landing page, distinct from the recommendation unlock gate. This capture does not yet exist.

**Purpose:** Collect emails from people who are interested in the product's journey but are not ready to run the wizard. These are early adopters, potential advocates, and the natural audience for build-in-public content.

**Recommended implementation:**
- A single low-friction line on the landing page below the primary CTA
- Copy suggestion: `Following the build? Get updates →` with a simple email input
- Store with `signup_source = 'follow_the_build'` to keep separate from unlock metrics
- Do not gate this behind consent to receive recommendations — it is a different relationship

**This is the highest-priority missing surface before any serious content push.** Without it, the build-in-public content has nowhere to send interested people except into the product funnel, which mixes two different audiences and two different intent signals.

---

## Content Calendar Skeleton (First 30 Days)

| Week | Theme | Channel | Notes |
|------|-------|---------|-------|
| 1 | What the product is and why one answer | LinkedIn | Explain the core decision. No metrics yet. |
| 1 | Product is live — intro post | Twitter/X | Short. Link to landing. |
| 2 | The email-as-business-model post | LinkedIn | Honest explanation of the value exchange. |
| 2 | Behind the unlock gate design | LinkedIn | Why the gate exists and what changed in 2026-03-14. |
| 3 | First real numbers (if available) | LinkedIn + Twitter | Wizard completions, unlock rate. |
| 3 | r/SideProject intro post | Reddit | Only if 100+ unlocks reached. |
| 4 | The one-answer decision explained | LinkedIn | The core positioning argument in full. |
| 4 | What we learned from the first users | LinkedIn | Feedback signal, what surprised us. |

---

## What to Measure

- Email list growth from "follow the build" capture (separate metric from unlock list)
- LinkedIn post engagement rate (not follower count — engagement per post matters more at this stage)
- Reddit post comment engagement (quality signal, not upvote count)
- Wizard completions attributable to content traffic (`signup_source` tracking)

---

## What Not to Do

- Do not post on every channel at once. Start with LinkedIn only and add channels when the content rhythm is established.
- Do not promise features that are not shipped.
- Do not post motivational content unrelated to the product.
- Do not treat follower count as a success metric at this phase.
- Do not mix the "follow the build" audience with the product conversion funnel in analytics.
