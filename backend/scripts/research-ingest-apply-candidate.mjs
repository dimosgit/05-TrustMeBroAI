import path from "node:path";
import { fileURLToPath } from "node:url";
import { closePool, pool } from "../src/db.js";
import { runResearchIngestionApplyCandidate } from "../src/researchIngest/pipeline.js";

function readArg(flag, argv) {
  const index = argv.indexOf(flag);
  if (index === -1 || index + 1 >= argv.length) {
    return null;
  }
  return argv[index + 1];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const argv = process.argv.slice(2);

const releaseId = readArg("--release-id", argv);
const confirmToken = readArg("--confirm", argv);
const stagingDirArg = readArg("--staging-dir", argv);
const stagingDir = stagingDirArg
  ? path.resolve(stagingDirArg)
  : path.join(projectRoot, "backend", "db", "staging", "research_ingest");

if (!releaseId || !confirmToken) {
  console.error(
    "Usage: npm run research:ingest:apply -- --release-id <id> --confirm APPLY_CANDIDATE_RELEASE [--staging-dir <path>]"
  );
  process.exit(1);
}

if (!pool) {
  console.error("DATABASE_URL is required for apply mode.");
  process.exit(1);
}

try {
  const summary = await runResearchIngestionApplyCandidate({
    projectRoot,
    dbPool: pool,
    releaseId,
    confirmToken,
    stagingDir
  });

  console.log("[research-ingest] apply complete");
  console.log(`[research-ingest] release: ${summary.release_id}`);
  console.log(`[research-ingest] applied tools: ${summary.applied_tool_count}`);
  console.log(`[research-ingest] evidence: ${summary.summary_path}`);
} catch (error) {
  console.error(`[research-ingest] apply failed: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  await closePool();
}
