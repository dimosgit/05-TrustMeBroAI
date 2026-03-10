# TrustMeBroAI - Product Plan (AI Tool Consultant)

## Document Purpose
This is the canonical product-direction document for TrustMeBroAI.

Use this document to align product, UX, data, and engineering decisions.
If there is a conflict between implementation details and product intent, this document defines the expected product behavior.

---

## Vision
TrustMeBroAI removes the burden of researching AI tools. You tell it what you need to do, it tells you exactly which tool to use — no comparison tables, no feature lists, no thinking required.

Core promise:
`Tell us what you want to do. TrustMeBroAI tells you which AI tool to use.`

---

## Problem Statement
The AI tool ecosystem is overwhelming. New tools appear weekly, pricing changes constantly, and non-technical users waste hours reading comparison articles that leave them more confused than when they started.

Most comparison sites make the problem worse: they give you more data, more columns, more decisions. They hand you a spreadsheet when you asked for an answer.

TrustMeBroAI is the opposite of a comparison site. It gives you one confident answer and lets you get on with your work.

---

## Anti-Pattern: What TrustMeBroAI Is NOT

TrustMeBroAI is explicitly NOT a comparison site. It does not show:
- feature comparison tables,
- side-by-side scoring grids,
- long lists of alternatives with detailed breakdowns.

Any implementation that adds comparison complexity to the result screen is working against the product's core purpose.

The product should feel like asking a knowledgeable friend — they don't hand you a spreadsheet, they say "use this one, here's why" and you trust them.

---

## Target Users
Primary audiences:
- business professionals,
- consultants,
- students,
- developers,
- founders.

User goal: get a confident tool recommendation in under a minute, without having to think or research.

---

## Product Value Proposition
Key benefits:
- eliminates research time entirely,
- removes decision fatigue,
- delivers one clear, confident answer,
- keeps recommendations current as tools evolve,
- accessible for non-technical users.

TrustMeBroAI should feel like a trusted friend who already did all the research and just tells you what to use.

---

## Business Model: Email Capture

The primary business goal of TrustMeBroAI is to build an email audience.

The product is free and always will be. In exchange for a genuinely useful recommendation, users provide their email address. This is the core value exchange the product is built around.

Email capture is not a secondary feature — it is the reason the product exists. Every UX decision should be evaluated against whether it helps or hurts email conversion.

### How the email gate works

The wizard is free and requires no account. After completing the flow, the user lands on the result screen where they can see the 2nd and 3rd options (names only, quietly displayed) — but the #1 recommendation is locked behind an email gate.

The user knows the answer exists. They can see there are alternatives. But the thing they actually came for — the confident top pick — requires their email to unlock.

This is the maximum motivation moment: they invested 2 minutes in the wizard, the answer is visibly right there, and one email stands between them and it. The pain of not knowing does the conversion work.

This approach:
- maximises email conversion by gating the answer, not the extras,
- creates genuine desire before asking for anything,
- builds an opted-in audience who are already invested in getting the result.

### Email compliance
- Explicit opt-in consent at signup, not buried in terms.
- Transparent about what they will receive (product updates, useful AI tool recommendations).
- GDPR-aware data handling.
- `email_consent` boolean and `consent_timestamp` stored per user.
- `signup_source` tracked per user (LinkedIn, Twitter, direct, etc.) to understand which content converts.

---

## MVP User Flow

1. User lands on website.
2. User completes the wizard (no account required):
   - selects their profile (business, developer, consultant, student),
   - selects their task,
   - selects their top priority (quality, speed, ease of use, price).
3. Result screen shown immediately (no account required):
   - **Secondary options visible** — 2 alternative tools, names only, one-word context each.
   - **Primary recommendation locked** — blurred or hidden card with a clear prompt: *"Enter your email to reveal your best match."*
4. User enters email to unlock:
   - Account created.
   - Primary recommendation revealed: tool name, logo, one punchy sentence, "Try it →" button.
   - User is now on the email list.

---

## Result Screen Design Contract

This section defines exactly what the result screen must look like. It is a product constraint, not a suggestion.

### Before email — what the user sees immediately
- **Secondary options** (visible, no gate) — label: *"Also consider:"*, two tool names, one-word context each. Example: *"Humata — free tier"* or *"Microsoft Copilot — already in Office"*. No scores, no descriptions.
- **Primary recommendation** (locked) — a visibly blurred or hidden card. Clear prompt above or on it: *"Enter your email to reveal your best match."* The user must feel the answer is right there, one step away.

### After email — what gets revealed
- Tool name + logo — large and confident.
- One sentence: why this tool for this task, tied to what the user selected. Example: *"Best for analyzing PDFs without any setup required."*
- One button: **"Try it →"** linking to the tool's website.

### What must never appear on the result screen
- Comparison tables.
- Numeric scores or ratings shown to users.
- Feature lists.
- More than 3 tools total (1 primary + 2 secondary).
- Any UI that makes the user feel like they need to keep researching.

---

## Recommendation Output Contract (Internal / API)

The recommendation API returns structured data used to render the result screen. Internal scoring fields are never shown to users directly — they power the decision but stay behind the scenes.

Required fields per tool in the API response:
- `tool_name`
- `tool_slug`
- `logo_url`
- `best_for` — one punchy sentence for display
- `website`
- `category`
- `pricing` — internal scoring input
- `ease_of_use` — integer 1–5, internal scoring input
- `speed` — integer 1–5, internal scoring input
- `quality` — integer 1–5, internal scoring input
- `target_users`
- `tags`

The recommendation endpoint returns:
- `primary_tool` — single tool object
- `primary_reason` — one sentence explanation for display
- `alternative_tools` — array of 2, each with name + one-word context only
- `session_id` — for linking to the user account after email capture


## Initial Dataset (MVP)
Target size: 20–30 well-known tools, manually curated from existing research files.

Initial categories:
- Document/PDF
- Coding
- Automation
- Content Creation
- Research

Example tools:
- Document/PDF: ChatGPT, Claude, Microsoft Copilot, Humata
- Coding: ChatGPT, GitHub Copilot, Cursor, Codeium
- Automation: Zapier, Make, n8n
- Content: Jasper, Copy.ai, Writesonic
- Research: Perplexity, Elicit

---

## Decision Logic (MVP)
Initial recommendation logic:
- deterministic weighted scoring based on `quality`, `speed`, `ease_of_use`, and `pricing` fields,
- weights shift based on the user's selected priority (e.g. "Best quality" → quality-heavy, "Easiest to use" → ease-heavy),
- no opaque autonomous behavior in MVP,
- the `primary_reason` sentence reflects the actual scoring outcome in plain language.

Design requirement: the recommendation must be confident and feel authoritative, not hedged.

---

## Data and Update Strategy
The AI tools market is dynamic, so keeping tool data current is a core product function.

Update channels:
- research markdown files in `docs/research/`,
- manual curation (primary method for MVP),
- scripted updates,
- future AI-assisted enrichment (Gemini CLI research, YouTube transcript ingestion, other agents).

Governance principles:
- safe updates only,
- clear change history,
- rollback capability,
- no accidental destructive writes.

Reference architecture:
`docs/planning/2026-03-10-research-driven-tool-db-safe-auto-update-architecture.md`

---

## Build-in-Public Strategy
Challenge framing: **"Building TrustMeBroAI in 40 Hours."**

This framing provides:
- a clear narrative,
- urgency,
- a social content engine during development.

Distribution channels:
- LinkedIn
- X/Twitter
- YouTube Shorts

Video format (30–45 seconds):
1. Hook — current hour/milestone
2. What was built
3. Quick demo
4. Problem encountered
5. Next step

The landing page should include a low-friction "follow the build" email capture separate from the product wizard — for people who are interested in the journey but not ready to use the product yet.

---

## Technical Delivery Strategy
Implementation style:
- fast iterative delivery with AI coding assistance,
- manually curated 25–30 tool dataset for MVP (automated ingestion pipeline is a post-MVP concern),
- recommendation scoring logic before any advanced intelligence,
- minimal DevOps overhead.

Deployment baseline:
- Dockerized services,
- existing server infrastructure (Coolify).

Non-goals for MVP:
- no comparison tables or feature grids in the UI,
- no over-engineered autonomous ingestion system in v1,
- no pgvector or semantic retrieval before structured scoring is proven insufficient,
- no heavy enterprise workflow complexity before core recommendation quality is validated.

---

## MVP Success Criteria
MVP is successful when:
1. Users can complete the wizard in under 60 seconds.
2. Users are motivated enough by seeing the locked answer to enter their email.
3. After unlocking, users click "Try it →" on the revealed recommendation.

Primary success metrics:
- wizard completion rate,
- email capture conversion rate (most important),
- "Try it" click-through rate after unlock,
- return visits.

---

## Long-Term Product Potential
If email list and traction grow:
- expand tool knowledge base,
- launch newsletter with curated AI tool recommendations,
- evolve into an AI workflow advisor,
- explore curated AI tools marketplace with referral/affiliate links (`referral_url` field in tools table — add now, even if empty for MVP).

---

## Guidance for Other AI Agents
When contributing to this repository:
1. Treat this file as the product source of truth.
2. The result screen shows ONE primary recommendation. Do not add comparison tables, feature grids, or detailed alternative breakdowns.
3. Secondary options are shown as name + one-word context only — no scores, no descriptions.
4. Email capture is the core business goal. Do not remove or weaken the email gate.
5. Preserve simplicity. Do not introduce complexity that slows down or clutters the user flow.
6. Keep scoring logic internal and invisible to users. Users see a confident answer, not the math behind it.
7. Align implementation with the data safety and update architecture document.

If proposing changes, explicitly state:
- what user problem is solved,
- what product metric should improve (especially email conversion),
- what tradeoff is introduced.
