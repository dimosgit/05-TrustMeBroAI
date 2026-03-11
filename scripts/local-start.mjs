import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPortConflictDiagnostics,
  decideBackendStartMode
} from "./local-start.helpers.mjs";

const BACKEND_PORT = 8080;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const BACKEND_HEALTH_URL = `${BACKEND_URL}/api/health`;
const FRONTEND_DEFAULT_URL = "http://localhost:5174";
const ANSI_ESCAPE_PATTERN = /\u001b\[[0-9;]*[A-Za-z]/g;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function stripAnsi(value) {
  return value.replace(ANSI_ESCAPE_PATTERN, "");
}

function emitLines(stream, output, onLine) {
  if (!stream) {
    return;
  }

  let buffer = "";

  stream.on("data", (chunk) => {
    const text = chunk.toString();
    output.write(text);
    buffer += text;

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex);
      onLine?.(stripAnsi(line).trim());
      buffer = buffer.slice(newlineIndex + 1);
      newlineIndex = buffer.indexOf("\n");
    }
  });

  stream.on("end", () => {
    if (buffer.length > 0) {
      onLine?.(stripAnsi(buffer).trim());
      buffer = "";
    }
  });
}

function startService(name, cwd, options = {}) {
  const child = spawn(npmCommand(), ["run", "dev"], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
  });

  emitLines(child.stdout, process.stdout, options.onStdoutLine);
  emitLines(child.stderr, process.stderr, options.onStderrLine);

  return child;
}

function detectFrontendUrl(line) {
  if (!line || !line.toLowerCase().includes("local:")) {
    return null;
  }

  const match = line.match(/https?:\/\/localhost:\d+\/?/i);
  if (!match) {
    return null;
  }

  return match[0].endsWith("/") ? match[0].slice(0, -1) : match[0];
}

async function checkPortInUse(port) {
  return new Promise((resolve, reject) => {
    const tester = net
      .createServer()
      .once("error", (error) => {
        if (error.code === "EADDRINUSE" || error.code === "EACCES") {
          resolve(true);
          return;
        }
        reject(error);
      })
      .once("listening", () => {
        tester.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(false);
        });
      });

    tester.listen(port, "0.0.0.0");
  });
}

async function probeBackendHealth(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 1500);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function runHintCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8"
  });

  if (result.error) {
    return null;
  }

  const output = [result.stdout || "", result.stderr || ""]
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  return output.length > 0 ? output : null;
}

function getPortProcessHint(port) {
  if (process.platform === "win32") {
    return null;
  }

  const lsofHint = runHintCommand("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"]);
  if (lsofHint) {
    return lsofHint;
  }

  const ssHint = runHintCommand("ss", ["-ltnp", `sport = :${port}`]);
  if (ssHint) {
    return ssHint;
  }

  return null;
}

function attachServiceLifecycle(services) {
  let shuttingDown = false;
  let expectedExitCode = 0;
  let exitedServices = 0;

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
      exitedServices += 1;

      if (!shuttingDown) {
        if (typeof code === "number" && code !== 0) {
          expectedExitCode = code;
        } else if (signal) {
          expectedExitCode = 1;
        }

        shutdown();
      }

      if (exitedServices === services.length) {
        process.exit(expectedExitCode);
      }
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

async function main() {
  console.log("Starting local dev mode (backend + frontend)...");

  const backendMode = await decideBackendStartMode({
    checkPortInUse: () => checkPortInUse(BACKEND_PORT),
    probeHealth: () => probeBackendHealth(BACKEND_HEALTH_URL)
  });

  if (backendMode.mode === "conflict") {
    const processHint = getPortProcessHint(BACKEND_PORT);
    console.error(
      buildPortConflictDiagnostics({
        port: BACKEND_PORT,
        processHint,
        healthPayload: backendMode.healthPayload
      })
    );
    process.exit(1);
    return;
  }

  const services = [];

  if (backendMode.mode === "spawn") {
    console.log(`[local:start] Backend mode: spawned (${BACKEND_URL})`);
    services.push(startService("backend", path.join(ROOT, "backend")));
  } else {
    console.log(`[local:start] Backend mode: reused existing backend (${BACKEND_URL})`);
  }

  console.log(`[local:start] Backend health: ${BACKEND_HEALTH_URL}`);
  console.log(`[local:start] Frontend requested URL: ${FRONTEND_DEFAULT_URL}`);

  let reportedFrontendUrl = FRONTEND_DEFAULT_URL;

  const frontendService = startService("frontend", path.join(ROOT, "frontend"), {
    onStdoutLine: (line) => {
      const detectedUrl = detectFrontendUrl(line);
      if (!detectedUrl || detectedUrl === reportedFrontendUrl) {
        return;
      }

      reportedFrontendUrl = detectedUrl;
      console.log(
        `[local:start] Frontend URL moved from ${FRONTEND_DEFAULT_URL} to ${reportedFrontendUrl}`
      );
    }
  });

  services.push(frontendService);
  attachServiceLifecycle(services);
}

main().catch((error) => {
  console.error(`[local:start] Fatal startup error: ${error.message}`);
  process.exit(1);
});
