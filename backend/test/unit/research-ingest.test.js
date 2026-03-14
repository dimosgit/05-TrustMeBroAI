import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  applyApprovedCandidatesInTransaction,
  buildResearchIngestionArtifacts,
  resolveApprovedCandidates,
  runResearchIngestionApplyCandidate,
  runResearchIngestionDryRun
} from "../../src/researchIngest/pipeline.js";

test("research ingest artifacts are deterministic and conflict-aware", () => {
  const sourceDocuments = [
    {
      sourceFile: "docs/research/a.md",
      content: [
        "## 1. Deterministic Tool",
        "**Category:** Research",
        "**Website:** deterministic.ai",
        "**Pricing Model:** Freemium",
        "**Ease of Use (1–5):** 4",
        "**Quality (1–5):** 4",
        "**Speed (1–5):** 4"
      ].join("\n")
    },
    {
      sourceFile: "docs/research/b.md",
      content: [
        "## 1. Deterministic Tool",
        "**Category:** Research",
        "**Website:** det-v2.ai",
        "**Pricing Model:** Freemium",
        "**Ease of Use (1–5):** 4",
        "**Quality (1–5):** 4",
        "**Speed (1–5):** 4"
      ].join("\n")
    }
  ];

  const first = buildResearchIngestionArtifacts({ sourceDocuments });
  const second = buildResearchIngestionArtifacts({ sourceDocuments });

  assert.deepEqual(first, second);
  assert.equal(first.candidateTools.length, 1);
  assert.equal(first.candidateTools[0].tool_slug, "deterministic-tool");
  assert.equal(first.candidateTools[0].status, "review_required");
  assert.ok(
    first.candidateConflicts.conflicts.some(
      (conflict) =>
        conflict.tool_slug === "deterministic-tool" &&
        conflict.type === "identity_conflict" &&
        conflict.field === "website"
    )
  );
});

test("research ingest dry-run writes staging artifacts", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tmb-research-ingest-"));
  const researchDir = path.join(tempRoot, "docs", "research");
  const stagingDir = path.join(tempRoot, "backend", "db", "staging", "research_ingest");

  await fs.mkdir(researchDir, { recursive: true });
  await fs.writeFile(
    path.join(researchDir, "single.md"),
    [
      "**Tool Name:** Stable Tool",
      "**Category:** Coding",
      "**Website:** stable.dev",
      "**Pricing Model:** Paid ($10/month)",
      "**Ease of Use (1–5):** 4",
      "**Quality (1–5):** 5",
      "**Speed (1–5):** 4",
      "**Typical Users:** Developers, Engineering teams"
    ].join("\n"),
    "utf8"
  );

  const summary = await runResearchIngestionDryRun({ projectRoot: tempRoot });
  assert.equal(summary.source_count, 1);
  assert.equal(summary.candidate_count, 1);

  const requiredFiles = [
    "candidate_tools.jsonl",
    "candidate_evidence.jsonl",
    "candidate_conflicts.json",
    "curation_decisions.json",
    "approved_tool_updates.sql"
  ];

  for (const name of requiredFiles) {
    const absolute = path.join(stagingDir, name);
    const stat = await fs.stat(absolute);
    assert.equal(stat.isFile(), true);
  }
});

test("research ingest dry-run preserves approved decisions and keeps approved_count above zero", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tmb-research-preserve-"));
  const researchDir = path.join(tempRoot, "docs", "research");
  const stagingDir = path.join(tempRoot, "backend", "db", "staging", "research_ingest");

  await fs.mkdir(researchDir, { recursive: true });
  await fs.mkdir(stagingDir, { recursive: true });

  await fs.writeFile(
    path.join(researchDir, "candidate.md"),
    [
      "**Tool Name:** Sticky Tool",
      "**Category:** Knowledge management",
      "**Website:** sticky.dev",
      "**Pricing Model:** Freemium",
      "**Ease of Use (1–5):** 4",
      "**Quality (1–5):** 4",
      "**Speed (1–5):** 4",
      "**Typical Users:** Knowledge workers"
    ].join("\n"),
    "utf8"
  );

  await fs.writeFile(
    path.join(stagingDir, "curation_decisions.json"),
    `${JSON.stringify(
      [
        {
          tool_slug: "sticky-tool",
          decision: "approve",
          rationale: "Previously curated approval for controlled candidate release.",
          source_files: ["docs/research/candidate.md"]
        }
      ],
      null,
      2
    )}\n`,
    "utf8"
  );

  const summary = await runResearchIngestionDryRun({
    projectRoot: tempRoot,
    researchDir,
    stagingDir
  });

  assert.equal(summary.approved_count, 1);

  const decisions = JSON.parse(
    await fs.readFile(path.join(stagingDir, "curation_decisions.json"), "utf8")
  );
  const stickyDecision = decisions.find((row) => row.tool_slug === "sticky-tool");
  assert.equal(stickyDecision.decision, "approve");

  const conflicts = JSON.parse(
    await fs.readFile(path.join(stagingDir, "candidate_conflicts.json"), "utf8")
  );
  assert.equal(conflicts.conflicts.some((row) => row.tool_slug === "sticky-tool"), false);
  assert.equal(
    Array.isArray(conflicts.suppressed_by_curation) &&
      conflicts.suppressed_by_curation.some((row) => row.tool_slug === "sticky-tool"),
    true
  );

  const candidateRow = (
    await fs
      .readFile(path.join(stagingDir, "candidate_tools.jsonl"), "utf8")
      .then((raw) =>
        raw
          .trim()
          .split(/\n+/)
          .map((line) => JSON.parse(line))
      )
  ).find((row) => row.tool_slug === "sticky-tool");
  assert.equal(candidateRow.status, "approved");
});

test("candidate apply rejects approved slugs when conflicts are unresolved", () => {
  assert.throws(
    () =>
      resolveApprovedCandidates({
        candidateTools: [
          {
            tool_name: "Stable Tool",
            tool_slug: "stable-tool",
            website: "https://stable.dev",
            category: "Coding",
            pricing: "Paid",
            pricing_tier: "paid_low",
            ease_of_use: 4,
            speed: 4,
            quality: 5
          }
        ],
        curationDecisions: [{ tool_slug: "stable-tool", decision: "approve" }],
        candidateConflicts: {
          conflicts: [{ tool_slug: "stable-tool", type: "identity_conflict", field: "website" }]
        }
      }),
    /unresolved conflicts/i
  );
});

test("candidate apply transaction rolls back on insert failure", async () => {
  const statements = [];
  let released = false;

  const dbPool = {
    async connect() {
      return {
        async query(text) {
          statements.push(text);
          if (/INSERT INTO tools/i.test(text)) {
            throw new Error("insert failure");
          }
          return { rowCount: 1 };
        },
        release() {
          released = true;
        }
      };
    }
  };

  await assert.rejects(
    () =>
      applyApprovedCandidatesInTransaction({
        dbPool,
        approvedCandidates: [
          {
            tool_name: "Stable Tool",
            tool_slug: "stable-tool",
            website: "https://stable.dev",
            category: "Coding",
            pricing: "Paid",
            pricing_tier: "paid_low",
            ease_of_use: 4,
            speed: 4,
            quality: 5,
            target_users: ["Developer"],
            tags: ["coding"],
            context_word: "coding",
            record_status: "active"
          }
        ]
      }),
    /insert failure/
  );

  assert.equal(statements[0], "BEGIN");
  assert.equal(statements.includes("ROLLBACK"), true);
  assert.equal(released, true);
});

test("candidate apply succeeds only with explicit confirmation token", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tmb-research-apply-"));
  const stagingDir = path.join(tempRoot, "backend", "db", "staging", "research_ingest");

  await fs.mkdir(stagingDir, { recursive: true });

  const candidate = {
    tool_name: "Stable Tool",
    tool_slug: "stable-tool",
    website: "https://stable.dev",
    category: "Coding",
    pricing: "Paid",
    pricing_tier: "paid_low",
    ease_of_use: 4,
    speed: 4,
    quality: 5,
    best_for: "Engineering",
    target_users: ["Developer"],
    tags: ["coding"],
    context_word: "coding",
    record_status: "active"
  };

  await fs.writeFile(path.join(stagingDir, "candidate_tools.jsonl"), `${JSON.stringify(candidate)}\n`, "utf8");
  await fs.writeFile(path.join(stagingDir, "candidate_conflicts.json"), `{"conflicts":[]}\n`, "utf8");
  await fs.writeFile(
    path.join(stagingDir, "curation_decisions.json"),
    `${JSON.stringify([{ tool_slug: "stable-tool", decision: "approve" }], null, 2)}\n`,
    "utf8"
  );

  await assert.rejects(
    () =>
      runResearchIngestionApplyCandidate({
        projectRoot: tempRoot,
        dbPool: { connect: async () => ({ query: async () => ({}), release() {} }) },
        releaseId: "candidate-001",
        confirmToken: "WRONG_TOKEN",
        stagingDir
      }),
    /confirmation token mismatch/i
  );

  const statements = [];
  const dbPool = {
    async connect() {
      return {
        async query(text) {
          statements.push(text);
          return { rowCount: 1 };
        },
        release() {}
      };
    }
  };

  const summary = await runResearchIngestionApplyCandidate({
    projectRoot: tempRoot,
    dbPool,
    releaseId: "candidate-001",
    confirmToken: "APPLY_CANDIDATE_RELEASE",
    stagingDir,
    now: new Date("2026-03-14T15:00:00.000Z")
  });

  assert.equal(summary.applied_tool_count, 1);
  assert.equal(summary.applied_tool_slugs[0], "stable-tool");
  assert.equal(statements[0], "BEGIN");
  assert.equal(statements.at(-1), "COMMIT");

  const evidenceStat = await fs.stat(summary.summary_path);
  assert.equal(evidenceStat.isFile(), true);
});
