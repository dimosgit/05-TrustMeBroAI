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
      { status: "in_progress", text: "Preserve and use requires_passkey_enrollment after recovery verify" },
      { status: "in_progress", text: "Real-device passkey validation sweep on desktop and mobile" }
    ]
  },
  {
    title: "Phase 2 Sprint 2 Product Foundation",
    tasks: [
      { status: "in_progress", text: "Backend: authenticated recommendation history API" },
      { status: "in_progress", text: "Backend: account/auth funnel metrics foundation" },
      { status: "in_progress", text: "Frontend: authenticated recommendation history UI" },
      { status: "in_progress", text: "Frontend: extract English copy into translation resources" },
      { status: "in_progress", text: "Frontend: recovery-based passkey enrollment guidance" },
      { status: "not_started", text: "QA: history regression gate" },
      { status: "not_started", text: "QA: English parity validation after i18n extraction" },
      { status: "in_progress", text: "QA: real-device passkey validation sweep" },
      { status: "not_started", text: "Integration: Sprint 2 closeout and merge gate" }
    ]
  },
  {
    title: "Support Workstream: Marketing and Copy",
    tasks: [
      { status: "completed", text: "Current live copy baseline documented" },
      { status: "in_progress", text: "Marketing copy audit" },
      { status: "in_progress", text: "Build-in-public strategy" },
      { status: "in_progress", text: "Copy recommendations for landing, unlock, auth, and follow-the-build capture" }
    ]
  },
  {
    title: "Phase 3 Preview",
    tasks: [
      { status: "not_started", text: "Subscription tiers and entitlements" },
      { status: "not_started", text: "Newsletter personalization" },
      { status: "not_started", text: "Advanced retrieval only if deterministic scoring becomes insufficient" }
    ]
  }
];
