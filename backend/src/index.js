import "dotenv/config";
import { createApp } from "./app.js";
import { loadRuntimeConfig } from "./config/env.js";
import { closePool } from "./db.js";
import { createMockRuntimeDependencies } from "./mock/createMockServices.js";

const config = loadRuntimeConfig();
const useMockData = process.env.USE_MOCK_DATA === "true";

if (!useMockData && !config.databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const mockDependencies = useMockData ? createMockRuntimeDependencies() : {};
const app = createApp({
  config,
  ...mockDependencies
});
const server = app.listen(config.port, () => {
  console.log(
    `Backend listening on port ${config.port} (${useMockData ? "mock" : config.nodeEnv})`
  );
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  server.close(async () => {
    try {
      await closePool();
    } finally {
      process.exit(signal === "SIGTERM" ? 0 : 130);
    }
  });
}

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});
