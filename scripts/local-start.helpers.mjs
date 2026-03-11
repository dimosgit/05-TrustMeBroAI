export function isTrustMeBroHealth(payload) {
  return Boolean(payload && typeof payload === "object" && payload.status === "ok");
}

export async function decideBackendStartMode({ checkPortInUse, probeHealth }) {
  const portInUse = await checkPortInUse();

  if (!portInUse) {
    return { mode: "spawn" };
  }

  let healthPayload = null;
  try {
    healthPayload = await probeHealth();
  } catch {
    healthPayload = null;
  }

  if (isTrustMeBroHealth(healthPayload)) {
    return { mode: "reuse", healthPayload };
  }

  return { mode: "conflict", healthPayload };
}

export function buildPortConflictDiagnostics({ port, processHint, healthPayload }) {
  const lines = [
    `Cannot start local stack: backend port ${port} is already in use by a non-TrustMeBro process.`,
    "",
    "How to fix:",
    `1. Find process using port ${port}:`,
    `   lsof -nP -iTCP:${port} -sTCP:LISTEN`,
    `   or: ss -ltnp 'sport = :${port}'`,
    "2. Stop that process (replace <PID>):",
    "   kill <PID>",
    "3. Retry local startup:",
    "   npm run local:start"
  ];

  if (healthPayload) {
    lines.push("", "Health probe response on occupied port:", JSON.stringify(healthPayload));
  }

  if (processHint) {
    lines.push("", "Port usage hint:", processHint.trimEnd());
  }

  return lines.join("\n");
}
