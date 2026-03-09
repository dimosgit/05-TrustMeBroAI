import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function startService(name, cwd) {
  const child = spawn(npmCommand(), ["run", "dev"], {
    cwd,
    stdio: "inherit"
  });
  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
  });
  return child;
}

const services = [
  startService("backend", path.join(ROOT, "backend")),
  startService("frontend", path.join(ROOT, "frontend"))
];

let shuttingDown = false;
let expectedExitCode = 0;
let exited = 0;

function shutdown(signal = "SIGTERM") {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const service of services) {
    if (!service.killed) {
      service.kill(signal);
    }
  }
}

for (const service of services) {
  service.on("exit", (code, signal) => {
    exited += 1;

    if (!shuttingDown) {
      if (typeof code === "number" && code !== 0) {
        expectedExitCode = code;
      } else if (signal) {
        expectedExitCode = 1;
      }
      shutdown();
    }

    if (exited === services.length) {
      process.exit(expectedExitCode);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

console.log("Starting local dev mode (backend + frontend)...");
console.log("Frontend: http://localhost:5174");
console.log("Backend health: http://localhost:8080/api/health");
