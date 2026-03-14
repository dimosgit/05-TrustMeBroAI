export const taskProgressSections = [
  {
    title: "Current State",
    items: [
      { label: "Current phase", value: "Phase 2" },
      { label: "Current sprint", value: "Sprint 2" },
      { label: "Current status", value: "In progress" }
    ]
  },
  {
    title: "Phase 2 Sprint 1 Open Mitigations",
    tasks: [
      {
        status: "in_progress",
        priority: "P0",
        text: "Preserve and use requires_passkey_enrollment after recovery verify"
      },
      {
        status: "in_progress",
        priority: "P0",
        text: "Real-device passkey validation sweep on desktop and mobile"
      }
    ]
  },
  {
    title: "Phase 2 Sprint 2 Product Foundation",
    tasks: [
      { status: "in_progress", priority: "P0", text: "Backend: authenticated recommendation history API" },
      { status: "in_progress", priority: "P1", text: "Backend: account/auth funnel metrics foundation" },
      { status: "in_progress", priority: "P0", text: "Frontend: authenticated recommendation history UI" },
      { status: "in_progress", priority: "P0", text: "Frontend: extract English copy into translation resources" },
      { status: "in_progress", priority: "P0", text: "Frontend: recovery-based passkey enrollment guidance" },
      { status: "not_started", priority: "P0", text: "QA: history regression gate" },
      { status: "not_started", priority: "P0", text: "QA: English parity validation after i18n extraction" },
      { status: "in_progress", priority: "P0", text: "QA: real-device passkey validation sweep" },
      { status: "not_started", priority: "P0", text: "Integration: Sprint 2 closeout and merge gate" }
    ]
  },
  {
    title: "Support Workstream: Marketing and Copy",
    tasks: [
      { status: "completed", priority: "P1", text: "Current live copy baseline documented" },
      { status: "in_progress", priority: "P1", text: "Marketing copy audit" },
      { status: "in_progress", priority: "P1", text: "Build-in-public strategy" },
      {
        status: "in_progress",
        priority: "P1",
        text: "Copy recommendations for landing, unlock, auth, and follow-the-build capture"
      }
    ]
  },
  {
    title: "Support Workstream: Recommendation Data and Research Ingestion",
    tasks: [
      { status: "in_progress", priority: "P1", text: "Architect: research-to-dataset ingestion design" },
      { status: "in_progress", priority: "P1", text: "Architect: curation, conflict-resolution, and confidence rules" },
      { status: "in_progress", priority: "P1", text: "Architect: recommendation evaluation and quality-check framework" },
      { status: "not_started", priority: "P1", text: "Backend: implement approved research ingestion pipeline" },
      { status: "not_started", priority: "P1", text: "QA: validate ingestion output and recommendation quality gates" },
      { status: "not_started", priority: "P2", text: "Decision checkpoint: confirm whether advanced retrieval is still unnecessary" }
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
