import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildResearchIngestionArtifacts,
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
