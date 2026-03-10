# TrustMeBroAI - Product Plan (AI Tool Consultant)

## Document Purpose
This is the canonical product-direction document for TrustMeBroAI.

Use this document to align product, UX, data, and engineering decisions.
If there is a conflict between implementation details and product intent, this document defines the expected product behavior.

## Vision
TrustMeBroAI helps people quickly choose the right AI tool for a specific task without manual research.

Core promise:
`Tell us what you want to do. TrustMeBroAI tells you which AI tool to use.`

## Problem Statement
The AI tool ecosystem changes quickly. New tools and pricing models appear frequently, and non-technical users struggle to evaluate:
- which tool fits their task,
- which alternatives are good enough,
- and why one recommendation is better than another.

Most comparison sites are too technical, outdated, or not personalized.

TrustMeBroAI solves this with a guided flow and curated recommendations.

## Target Users
Primary audiences:
- business professionals,
- consultants,
- students,
- developers,
- founders.

User goal:
- get to a confident tool choice in minutes,
- understand tradeoffs,
- avoid deep research.

## Product Value Proposition
Key benefits:
- saves research time,
- reduces decision fatigue,
- provides curated and explainable recommendations,
- keeps recommendations updated as tools evolve,
- remains accessible for non-technical users.

TrustMeBroAI should feel like a trusted friend who already researched the market.

## MVP Scope
The MVP is intentionally simple and focused on usefulness.

### MVP User Flow
1. User lands on website.
2. User creates account (email login).
3. User selects profile (business, developer, consultant, student).
4. User selects task.
5. TrustMeBroAI returns:
- recommended tools,
- alternatives comparison,
- explanation of recommendation.

### Example Input/Output
Input:
- Profile: Business user
- Task: Analyze a PDF

Output:
- Recommended tools: ChatGPT, Claude, Microsoft Copilot
- Comparison dimensions: price, speed, ease of use, strengths
- Explanation: why each tool was selected

## Recommendation Output Contract
Each recommendation response should include:
- top recommendation,
- 2-3 alternatives,
- plain-language explanation,
- structured comparison fields.

Required comparison fields for each tool:
- `tool_name`
- `category`
- `best_for`
- `pricing`
- `ease_of_use`
- `speed`
- `quality`
- `target_users`
- `tags`
- `website`

## Initial Dataset (MVP)
Target size:
- 20-30 well-known tools.

Initial categories:
- Document/PDF,
- Coding,
- Automation,
- Content Creation,
- Research.

Example tools:
- Document/PDF: ChatGPT, Claude, Microsoft Copilot, Humata
- Coding: ChatGPT, GitHub Copilot, Cursor, Codeium
- Automation: Zapier, Make, n8n
- Content: Jasper, Copy.ai, Writesonic
- Research: Perplexity, Elicit

## Decision Logic (MVP)
Initial recommendation logic:
- deterministic, rule-based or weighted scoring,
- no opaque autonomous behavior in MVP,
- explanation must reflect actual scoring logic.

Design requirement:
- recommendation must be explainable to non-technical users.

## Data and Update Strategy
The AI tools market is dynamic, so updates are a core product function.

Update channels:
- research markdown files,
- manual curation,
- scripted updates,
- future AI-assisted enrichment (for example: Gemini CLI research, YouTube transcript ingestion, other agents).

Governance principles:
- safe updates only,
- clear change history,
- rollback capability,
- no accidental destructive writes.

Reference architecture for this is documented in:
- `docs/planning/2026-03-10-research-driven-tool-db-safe-auto-update-architecture.md`

## Access Model and Audience Building
Usage model:
- free product access,
- requires account and email signup,
- users can receive product updates/newsletter.

Purpose:
- build early audience,
- maintain communication channel,
- support future monetization options.

Compliance expectations:
- transparent privacy policy,
- explicit email consent,
- GDPR-aware handling for personal data.

## Build-in-Public Strategy
Challenge framing:
- "Building TrustMeBroAI in 40 Hours."

Reason:
- clear narrative,
- urgency,
- social content engine during development.

Distribution channels:
- LinkedIn,
- X/Twitter,
- YouTube Shorts.

Video format (30-45 seconds):
1. Hook (current hour/milestone)
2. What was built
3. Quick demo
4. Problem encountered
5. Next step

## Technical Delivery Strategy
Implementation style:
- fast iterative delivery with AI coding assistance,
- small curated dataset first,
- recommendation logic before advanced intelligence,
- minimal DevOps overhead.

Deployment baseline:
- Dockerized services,
- existing server infrastructure.

Non-goals for MVP:
- no over-engineered autonomous system in v1,
- no heavy enterprise workflow complexity before core recommendation quality is validated.

## MVP Success Criteria
MVP is successful when users can:
1. quickly select a task,
2. receive relevant recommendations,
3. understand why those recommendations were returned.

Primary success metrics:
- completion rate of recommendation flow,
- time-to-recommendation,
- user-reported recommendation usefulness,
- return usage.

## Long-Term Product Potential
If traction is positive, evolve into:
- larger AI tool knowledge base,
- AI workflow advisor,
- curated AI tools marketplace,
- newsletter-driven audience platform.

## Guidance for Other AI Agents
When contributing to this repository:
1. Treat this file as product source of truth.
2. Preserve simplicity and explainability for non-technical users.
3. Do not introduce complexity that weakens usability in MVP.
4. Keep recommendations transparent and grounded in maintainable data.
5. Align implementation with the data safety and update architecture document.

If proposing changes, explicitly state:
- what user problem is solved,
- what product metric should improve,
- what tradeoff is introduced.
