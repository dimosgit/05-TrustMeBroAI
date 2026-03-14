export const taskProgressSections = [
  {
    title: "Current State",
    items: [
      { label: "Current phase", value: "Phase 2" },
      { label: "Current sprint", value: "Sprint 3" },
      { label: "Current status", value: "In progress" }
    ]
  },
  {
    title: "Phase 2 Sprint 1 Follow-Up UX/Auth Polish",
    tasks: [
      {
        status: "completed",
        priority: "P0",
        text: "Preserve and use requires_passkey_enrollment after recovery verify"
      },
      {
        status: "completed",
        priority: "P0",
        text: "Real-device passkey validation sweep on desktop and mobile"
      },
      { status: "not_started", priority: "P1", text: "Investigate and eliminate residual /result micro-blink" },
      { status: "not_started", priority: "P1", text: "Fix iOS Safari post-passkey viewport zoom" }
    ]
  },
  {
    title: "Phase 2 Sprint 2 Product Foundation",
    tasks: [
      { status: "completed", priority: "P0", text: "Backend: authenticated recommendation history API" },
      { status: "completed", priority: "P1", text: "Backend: account/auth funnel metrics foundation" },
      { status: "completed", priority: "P0", text: "Frontend: authenticated recommendation history UI" },
      { status: "completed", priority: "P0", text: "Frontend: extract English copy into translation resources" },
      { status: "completed", priority: "P0", text: "Frontend: recovery-based passkey enrollment guidance" },
      { status: "completed", priority: "P0", text: "QA: history regression gate" },
      { status: "completed", priority: "P0", text: "QA: English parity validation after i18n extraction" },
      { status: "completed", priority: "P0", text: "QA: real-device passkey validation sweep" },
      { status: "completed", priority: "P0", text: "Integration: Sprint 2 closeout and merge gate" }
    ]
  },
  {
    title: "Phase 2 Sprint 3 Growth and Recommendation Data Foundation",
    tasks: [
      { status: "in_progress", priority: "P0", text: "Backend: follow-the-build capture endpoint and source attribution flow" },
      {
        status: "in_progress",
        priority: "P0",
        text: "Backend: research ingestion parser, normalizer, and dry-run artifact generation"
      },
      { status: "in_progress", priority: "P0", text: "Frontend: landing follow-the-build capture UI" },
      { status: "in_progress", priority: "P1", text: "Frontend: apply approved follow-the-build and loading-copy updates" },
      { status: "in_progress", priority: "P1", text: "Frontend: fix iOS Safari passkey viewport zoom and /result micro-blink" },
      { status: "in_progress", priority: "P0", text: "QA: recommendation benchmark suite and ingestion gate harness" },
      {
        status: "not_started",
        priority: "P0",
        text: "QA: validate follow-the-build capture, source attribution, and anonymous funnel non-regression"
      },
      { status: "not_started", priority: "P0", text: "Integration: Sprint 3 closeout and merge gate" }
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
      { status: "in_progress", priority: "P1", text: "First 30-day content calendar and channel-ready launch assets" },
      { status: "in_progress", priority: "P1", text: "Final implementation-ready copy pack for the follow-the-build surface" }
    ]
  },
  {
    title: "Support Workstream: Recommendation Data and Research Ingestion",
    tasks: [
      { status: "completed", priority: "P1", text: "Architect: research-to-dataset ingestion design" },
      { status: "completed", priority: "P1", text: "Architect: curation, conflict-resolution, and confidence rules" },
      { status: "completed", priority: "P1", text: "Architect: recommendation evaluation and quality-check framework" },
      { status: "in_progress", priority: "P1", text: "Backend: implement approved research ingestion pipeline foundation" },
      { status: "in_progress", priority: "P1", text: "QA: implement ingestion output and recommendation quality gates" },
      { status: "not_started", priority: "P1", text: "Controlled first candidate release against research-derived updates" },
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
