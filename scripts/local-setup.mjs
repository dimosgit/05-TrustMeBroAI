import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import net from "node:net";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

function runQuiet(command, args, cwd = ROOT) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("exit", (code) => resolve(code === 0));
  });
}

async function commandExists(command) {
  const probe = process.platform === "win32" ? "where" : "which";
  return runQuiet(probe, [command]);
}

async function copyIfMissing(from, to) {
  if (existsSync(to)) {
    return;
  }
  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
}

async function setEnvVar(filePath, key, value) {
  const line = `${key}=${value}`;
  let content = "";
  if (existsSync(filePath)) {
    content = await readFile(filePath, "utf8");
  }

  const lines = content === "" ? [] : content.replace(/\r\n/g, "\n").split("\n");
  let found = false;
  const updated = lines.map((currentLine) => {
    if (currentLine.trimStart().startsWith("#")) {
      return currentLine;
    }
    if (new RegExp(`^\\s*${key}\\s*=`).test(currentLine)) {
      found = true;
      return line;
    }
    return currentLine;
  });

  if (!found) {
    updated.push(line);
  }

  const normalized = `${updated.filter((item, index, arr) => !(index === arr.length - 1 && item === "")).join("\n")}\n`;
  await writeFile(filePath, normalized, "utf8");
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function canConnectToPort(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 800);

    socket.once("connect", () => {
      clearTimeout(timeout);
      socket.end();
      resolve(true);
    });

    socket.once("error", () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

async function waitForPostgres(host, port, timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await canConnectToPort(host, port)) {
      return true;
    }
    await sleep(500);
  }
  return false;
}

async function tryStartPostgres(host, port) {
  if (await canConnectToPort(host, port)) {
    return true;
  }

  if (await commandExists("brew")) {
    const candidates = ["postgresql@16", "postgresql@15", "postgresql@14", "postgresql"];
    for (const service of candidates) {
      const started = await runQuiet("brew", ["services", "start", service]);
      if (started && (await waitForPostgres(host, port, 10000))) {
        console.log(`Started PostgreSQL via Homebrew service: ${service}`);
        return true;
      }
    }
  }

  if (await commandExists("docker")) {
    const started = await runQuiet("docker", ["compose", "up", "-d", "db"], ROOT);
    if (started && (await waitForPostgres(host, port, 15000))) {
      console.log("Started PostgreSQL via docker compose service: db");
      return true;
    }
  }

  return false;
}

async function main() {
  console.log("Installing backend dependencies...");
  await run(npmCommand(), ["install"], path.join(ROOT, "backend"));

  console.log("Installing frontend dependencies...");
  await run(npmCommand(), ["install"], path.join(ROOT, "frontend"));

  console.log("Preparing env files...");
  await copyIfMissing(
    path.join(ROOT, "backend", ".env.example"),
    path.join(ROOT, "backend", ".env")
  );
  await copyIfMissing(
    path.join(ROOT, "frontend", ".env.example"),
    path.join(ROOT, "frontend", ".env")
  );

  const backendEnv = path.join(ROOT, "backend", ".env");
  const frontendEnv = path.join(ROOT, "frontend", ".env");

  await setEnvVar(
    backendEnv,
    "FRONTEND_ORIGIN",
    "http://localhost:5174,http://127.0.0.1:5174"
  );
  await setEnvVar(backendEnv, "DATABASE_URL", "postgresql://localhost:5432/trustmebroai");
  await setEnvVar(frontendEnv, "VITE_API_BASE_URL", "/api");

  const databaseUrl = new URL("postgresql://localhost:5432/trustmebroai");
  const dbHost = databaseUrl.hostname || "localhost";
  const dbPort = Number(databaseUrl.port || "5432");

  console.log("Ensuring PostgreSQL is running...");
  const postgresReady = await tryStartPostgres(dbHost, dbPort);
  if (postgresReady) {
    await setEnvVar(backendEnv, "USE_MOCK_DATA", "false");
    console.log("Bootstrapping database schema + seed...");
    await run(npmCommand(), ["run", "db:bootstrap"], path.join(ROOT, "backend"));
  } else {
    await setEnvVar(backendEnv, "USE_MOCK_DATA", "true");
    console.log(
      "PostgreSQL was not detected. Falling back to backend mock mode for local development."
    );
  }

  console.log("Local setup is ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
