import path from "node:path";
import { fileURLToPath } from "node:url";
import { runResearchIngestionDryRun } from "../src/researchIngest/pipeline.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");

const summary = await runResearchIngestionDryRun({ projectRoot });

console.log("[research-ingest] dry-run complete");
console.log(`[research-ingest] sources: ${summary.source_count}`);
console.log(`[research-ingest] candidates: ${summary.candidate_count}`);
console.log(`[research-ingest] conflicts: ${summary.conflict_count}`);
console.log(`[research-ingest] approved: ${summary.approved_count}`);
console.log(`[research-ingest] staging: ${summary.staging_dir}`);
