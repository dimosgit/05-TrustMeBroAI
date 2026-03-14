export const taskProgressSections = [
  {
    title: "Current State",
    items: [
      { label: "Current phase", value: "Phase 2" },
      { label: "Current sprint", value: "Sprint 4" },
      { label: "Current status", value: "Sprint 4 complete with carryover" }
    ]
  },
  {
    title: "Archived Completed Sprints",
    items: [
      { label: "Phase 1 MVP", value: "Archived - complete" },
      { label: "Phase 2 Sprint 1", value: "Archived - complete with mitigations carried into Sprint 4" },
      { label: "Phase 2 Sprint 2", value: "Archived - complete" },
      { label: "Phase 2 Sprint 3", value: "Archived - complete" }
    ]
  },
  {
    title: "Phase 2 Sprint 4 Controlled Candidate Release and FE Polish",
    tasks: [
      { status: "completed", priority: "P0", text: "Backend: guarded apply path and candidate-release support for research ingestion" },
      { status: "completed", priority: "P1", text: "Frontend: fix iOS Safari passkey viewport zoom (code-level mitigation shipped)" },
      { status: "completed", priority: "P1", text: "Frontend: eliminate residual /result micro-blink during auto-unlock" },
      { status: "completed", priority: "P0", text: "QA: execute first controlled candidate release with benchmark and release-evidence bundle" },
      { status: "completed", priority: "P0", text: "Integration: Sprint 4 closeout and candidate release decision" }
    ]
  },
  {
    title: "Next Sprint Carryover (Safari Real-Device Validation)",
    tasks: [
      { status: "in_progress", priority: "P1", text: "QA + FE: run fresh iOS Safari real-device validation for passkey zoom and /result transition" },
      { status: "not_started", priority: "P1", text: "Attach Safari validation evidence pack and close carryover risk" }
    ]
  },
  {
    title: "Support Workstream: Marketing and Copy",
    tasks: [
      { status: "completed", priority: "P1", text: "Current live copy baseline documented" },
      { status: "completed", priority: "P1", text: "Marketing copy audit" },
      { status: "completed", priority: "P1", text: "Build-in-public strategy" },
      {
        status: "completed",
        priority: "P1",
        text: "Copy recommendations for landing, unlock, auth, and follow-the-build capture"
      },
      { status: "completed", priority: "P1", text: "First 30-day content calendar and channel-ready launch assets" },
      { status: "completed", priority: "P1", text: "Final implementation-ready copy pack for the follow-the-build surface" }
    ]
  },
  {
    title: "Support Workstream: Recommendation Data and Research Ingestion",
    tasks: [
      { status: "completed", priority: "P1", text: "Architect: research-to-dataset ingestion design" },
      { status: "completed", priority: "P1", text: "Architect: curation, conflict-resolution, and confidence rules" },
      { status: "completed", priority: "P1", text: "Architect: recommendation evaluation and quality-check framework" },
      { status: "completed", priority: "P1", text: "Backend: implement approved research ingestion pipeline foundation" },
      { status: "completed", priority: "P1", text: "QA: implement ingestion output and recommendation quality gates" },
      { status: "completed", priority: "P1", text: "Controlled first candidate release against research-derived updates" },
      { status: "completed", priority: "P2", text: "Decision checkpoint: confirm whether advanced retrieval is still unnecessary" }
    ]
  },
  {
    title: "Phase 3 Preview",
    tasks: [
      { status: "not_started", priority: "P2", text: "Subscription tiers and entitlements" },
      { status: "not_started", priority: "P2", text: "Newsletter personalization" },
      {
        status: "not_started",
        priority: "P2",
        text: "Advanced retrieval only if deterministic scoring becomes insufficient"
      }
    ]
  }
];
