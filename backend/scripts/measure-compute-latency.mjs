import { performance } from "node:perf_hooks";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";
const ITERATIONS = Number.parseInt(process.env.ITERATIONS || "15", 10);
const WARMUP = Number.parseInt(process.env.WARMUP || "5", 10);

function assertPositive(value, field) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
}

function percentile(sortedValues, quantile) {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = Math.ceil(sortedValues.length * quantile) - 1;
  return sortedValues[Math.max(0, Math.min(sortedValues.length - 1, index))];
}

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function requestJson(path, { method = "GET", body } = {}) {
  const response = await fetch(buildUrl(path), {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || `${method} ${path} failed with ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function pick(items, index, multiplier) {
  return items[(index * multiplier) % items.length];
}

function toFixed(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}

async function main() {
  assertPositive(ITERATIONS, "ITERATIONS");
  if (!Number.isInteger(WARMUP) || WARMUP < 0) {
    throw new Error("WARMUP must be a non-negative integer");
  }

  const [profiles, tasks, priorities] = await Promise.all([
    requestJson("/profiles"),
    requestJson("/tasks"),
    requestJson("/priorities")
  ]);

  if (!profiles.length || !tasks.length || !priorities.length) {
    throw new Error("Catalog lookup is empty; cannot run compute benchmark");
  }

  const durationsMs = [];
  const totalRuns = WARMUP + ITERATIONS;

  for (let i = 0; i < totalRuns; i += 1) {
    const profile = pick(profiles, i, 1);
    const task = pick(tasks, i, 3);
    const priority = pick(priorities, i, 5);

    const session = await requestJson("/recommendation/session", {
      method: "POST",
      body: {
        profile_id: profile.id,
        task_id: task.id,
        selected_priority: priority.name,
        wizard_duration_seconds: 20
      }
    });

    const computeStartedAt = performance.now();
    await requestJson("/recommendation/compute", {
      method: "POST",
      body: { session_id: session.session_id }
    });
    const elapsed = performance.now() - computeStartedAt;

    if (i >= WARMUP) {
      durationsMs.push(elapsed);
    }
  }

  const sorted = [...durationsMs].sort((a, b) => a - b);
  const summary = {
    api_base_url: API_BASE_URL,
    warmup_runs: WARMUP,
    measured_runs: ITERATIONS,
    avg_ms: toFixed(durationsMs.reduce((sum, value) => sum + value, 0) / durationsMs.length),
    p50_ms: toFixed(percentile(sorted, 0.5)),
    p95_ms: toFixed(percentile(sorted, 0.95)),
    p99_ms: toFixed(percentile(sorted, 0.99)),
    max_ms: toFixed(sorted[sorted.length - 1]),
    target_p95_ms: 500,
    target_met: percentile(sorted, 0.95) <= 500
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
