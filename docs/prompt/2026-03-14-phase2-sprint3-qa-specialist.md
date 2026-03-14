## 1. Feature Title
`Phase 2 Sprint 3 QA Specialist: Follow-the-Build Capture, Ingestion Gates, and UX Polish Validation`

## 2. Objective
Validate Phase 2 Sprint 3 with a release-gate mindset: the new follow-the-build capture flow must work and remain analytically distinct, the research-ingestion foundation must be testable and governed, and the remaining frontend auth polish issues must be checked without compromising the anonymous funnel.

## 3. Context
- Product area: `Growth flow QA and recommendation-data gate foundation`
- Current behavior: `Phase 2 Sprint 2 is complete. Architect and marketing design work are complete. Sprint 3 now combines a new landing capture surface, research-ingestion foundation work, and residual auth UX polish.`
- Problem to solve: `We need validation that the new growth surface is safe, that the ingestion foundation has real QA gates behind it, and that lingering browser/transition issues are either fixed or clearly bounded.`

Planning references:
1. `docs/planning/final-implementation-plan.md`
2. `PROJECT_STATUS.md`
3. `docs/planning/2026-03-12-post-stabilization-next-phase-plan.md`
4. `docs/planning/2026-03-14-recommendation-evaluation-framework.md`
5. `docs/planning/2026-03-14-research-ingestion-rollout-plan.md`
6. `docs/marketing/2026-03-14-copy-recommendations.md`

## 4. Scope
- In scope:
  1. Validate follow-the-build capture behavior and source attribution.
  2. Implement or formalize benchmark and gate scaffolding from the architect evaluation framework.
  3. Validate iOS Safari zoom and result auto-unlock polish outcomes.
  4. Protect the anonymous funnel and passkey flow from regression.
  5. Confirm internal routes remain disabled by default.
- Out of scope:
  1. Editing `docs/planning/final-implementation-plan.md`.
  2. Broad production analytics dashboard validation.
  3. Actual vector or retrieval-model validation.

## 5. Requirements
1. Produce a release-gate QA result for Sprint 3 with explicit pass/fail findings.
2. Validate that follow-the-build capture is:
   - separate from unlock
   - separately attributable
   - stable in UI and backend behavior
3. Build or formalize the first QA-owned benchmark/evidence scaffolding for research-ingestion changes.
4. Validate the remaining FE polish issues on real browsers/devices where possible.
5. Re-run anonymous funnel non-regression as a standing gate.

## 6. Technical Constraints
1. Do not modify `docs/planning/final-implementation-plan.md`.
2. Use the architect evaluation framework as the primary reference for ingestion QA design.
3. Prefer reproducible, auditable gate outputs over one-off manual notes.
4. Do not let research-ingestion validation drift into runtime retrieval redesign.
5. Keep `/tasks-progress` disabled by default and continue treating it as non-production.

## 7. Implementation Notes
1. Create benchmark and evidence scaffolding that future ingestion releases can reuse.
2. If code or fixture additions are needed, keep them tightly aligned with the architect documents.
3. Validate follow-the-build both functionally and analytically:
   - capture works
   - `signup_source` is distinct
   - anonymous wizard flow is unaffected
4. Record real-device or real-browser evidence for the two FE polish issues.
5. Save the QA output as a short release-gate report under `docs/planning/`.

## 8. Test Requirements
1. Run relevant checks before any QA signoff:
   - Backend lint: `cd backend && npm run lint`
   - Backend type check: `cd backend && npm run typecheck`
   - Backend unit tests: `cd backend && npm run test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Frontend lint: `cd frontend && npm run lint`
   - Frontend build: `cd frontend && npm run build`
   - Frontend tests: `cd frontend && npm run test`
   - Frontend smoke tests: `cd frontend && npm run test:e2e:smoke`
2. Add or update automated tests when QA-owned gate scaffolding requires it.
3. Do not create a commit if any required validation fails.
4. Include validation coverage for:
   - follow-the-build capture
   - source attribution separation
   - anonymous wizard/unlock non-regression
   - passkey flows where touched
   - internal route disabled-by-default behavior
   - benchmark/evidence scaffold existence and basic correctness

## 9. Acceptance Criteria
1. Sprint 3 has a documented QA gate result with explicit findings or signoff.
2. Follow-the-build capture is validated as a separate funnel.
3. Research-ingestion QA scaffolding exists and matches the architect framework.
4. Remaining FE polish issues are either fixed and validated or clearly documented as residual risk.

## 10. Deliverables
1. QA validation notes and a Sprint 3 release-gate report under `docs/planning/`.
2. Any QA-owned benchmark, fixture, or gate-scaffolding changes if needed.
3. Short implementation summary including exact commands executed and outcomes.

## 11. Mandatory Agent Rules
1. Execute all required validation before creating any commit.
2. Never commit code or docs that claim signoff when checks failed.
3. Report exact commands executed and whether each passed.
4. Escalate blockers instead of guessing.
5. Do not modify `docs/planning/final-implementation-plan.md`.

## 12. Assumptions and Open Questions
- Assumptions:
  1. Backend and frontend will land follow-the-build capture in this batch.
  2. This batch builds QA scaffolding for ingestion, not the first full data release.
- Open questions:
  1. Which real devices/browsers are available for the Safari zoom and passkey/polish validation pass?
