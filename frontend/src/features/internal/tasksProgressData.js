export const taskProgressSections = [
  {
    title: "Current State",
    items: [
      { label: "Current phase", value: "Phase 2" },
      { label: "Current sprint", value: "Sprint 5" },
      { label: "Current status", value: "In progress" }
    ]
  },
  {
    title: "Archived Completed Sprints",
    items: [
      { label: "Phase 1 MVP", value: "Archived - complete" },
      { label: "Phase 2 Sprint 1", value: "Archived - complete with mitigations carried into Sprint 4" },
      { label: "Phase 2 Sprint 2", value: "Archived - complete" },
      { label: "Phase 2 Sprint 3", value: "Archived - complete" },
      { label: "Phase 2 Sprint 4", value: "Archived - complete with Safari evidence carried into Sprint 5" }
    ]
  },
  {
    title: "Phase 2 Sprint 5 Verified Email Gate and Release Hardening",
    tasks: [
      { status: "in_progress", priority: "P0", text: "Backend: add verification-link request/verify flow for recommendation unlock" },
      { status: "in_progress", priority: "P0", text: "Backend: store verification status and verification-token lifecycle for unlock emails" },
      { status: "in_progress", priority: "P0", text: "Frontend: add verification-pending unlock state and verification-return handling" },
      { status: "in_progress", priority: "P0", text: "Frontend: update unlock messaging to make verification-link requirement explicit" },
      { status: "in_progress", priority: "P0", text: "QA: verify that unverified emails cannot unlock the primary recommendation" },
      { status: "not_started", priority: "P1", text: "Backend: add newsletter subscription state and unsubscribe flow for verified emails" },
      { status: "not_started", priority: "P1", text: "Backend: add provider sync or export path for verified subscribed emails" },
      { status: "not_started", priority: "P1", text: "QA: prove unverified and unsubscribed emails never receive newsletter sends" },
      { status: "in_progress", priority: "P1", text: "QA + FE: run fresh iOS Safari real-device validation for passkey zoom and /result transition evidence pack" },
      { status: "not_started", priority: "P0", text: "Integration: Sprint 5 closeout, verified-email gate review, and release hardening decision" }
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
