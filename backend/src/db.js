import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString
    })
  : null;

export async function query(text, params) {
  if (!pool) {
    throw new Error("DATABASE_URL is required when USE_MOCK_DATA is not enabled");
  }
  return pool.query(text, params);
}

export async function closePool() {
  if (pool) {
    await pool.end();
  }
}
