import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

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

  await setEnvVar(path.join(ROOT, "backend", ".env"), "FRONTEND_ORIGIN", "http://localhost:5174");
  await setEnvVar(path.join(ROOT, "backend", ".env"), "USE_MOCK_DATA", "true");
  console.log("Local setup is ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
