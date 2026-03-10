import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

function buildUrlWithDatabase(databaseName) {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is missing in backend/.env");
  }

  const parsed = new URL(raw);
  parsed.pathname = `/${databaseName}`;
  return parsed.toString();
}

function extractDatabaseName() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is missing in backend/.env");
  }

  const parsed = new URL(raw);
  const dbName = parsed.pathname.replace(/^\//, "");
  if (!dbName) {
    throw new Error("DATABASE_URL must include a database name");
  }

  return dbName;
}

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

async function runScript(client, relativePath) {
  const absolutePath = path.join(BACKEND_ROOT, relativePath);
  const sql = await readFile(absolutePath, "utf8");
  await client.query(sql);
}

async function ensureDatabaseExists() {
  const dbName = extractDatabaseName();

  const adminClient = new Client({
    connectionString: buildUrlWithDatabase("postgres")
  });

  await adminClient.connect();

  const existsResult = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1",
    [dbName]
  );

  if (existsResult.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
    console.log(`Created database: ${dbName}`);
  }

  await adminClient.end();
}

async function bootstrap() {
  await ensureDatabaseExists();

  const appClient = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await appClient.connect();

  await runScript(appClient, "db/init/001_schema.sql");
  await runScript(appClient, "db/init/002_seed.sql");

  await appClient.end();
}

bootstrap()
  .then(() => {
    console.log("Database schema and seed are up to date.");
  })
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
