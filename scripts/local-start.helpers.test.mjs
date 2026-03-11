import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPortConflictDiagnostics,
  decideBackendStartMode,
  isTrustMeBroHealth
} from "./local-start.helpers.mjs";

test("isTrustMeBroHealth accepts status ok", () => {
  assert.equal(isTrustMeBroHealth({ status: "ok" }), true);
  assert.equal(isTrustMeBroHealth({ status: "not-ok" }), false);
  assert.equal(isTrustMeBroHealth(null), false);
});

test("decideBackendStartMode returns spawn when backend port is free", async () => {
  const result = await decideBackendStartMode({
    checkPortInUse: async () => false,
    probeHealth: async () => {
      throw new Error("probeHealth should not be called when port is free");
    }
  });

  assert.deepEqual(result, { mode: "spawn" });
});

test("decideBackendStartMode returns reuse when occupied port serves TrustMeBro health", async () => {
  const result = await decideBackendStartMode({
    checkPortInUse: async () => true,
    probeHealth: async () => ({ status: "ok", mode: "database" })
  });

  assert.equal(result.mode, "reuse");
});

test("decideBackendStartMode returns conflict when occupied port is not TrustMeBro", async () => {
  const result = await decideBackendStartMode({
    checkPortInUse: async () => true,
    probeHealth: async () => ({ status: "down" })
  });

  assert.deepEqual(result, {
    mode: "conflict",
    healthPayload: { status: "down" }
  });
});

test("decideBackendStartMode returns conflict when health probe fails", async () => {
  const result = await decideBackendStartMode({
    checkPortInUse: async () => true,
    probeHealth: async () => {
      throw new Error("network failure");
    }
  });

  assert.deepEqual(result, {
    mode: "conflict",
    healthPayload: null
  });
});

test("buildPortConflictDiagnostics includes process hints when available", () => {
  const diagnostics = buildPortConflictDiagnostics({
    port: 8080,
    healthPayload: { status: "busy", service: "nginx" },
    processHint: "COMMAND   PID USER   FD\nnode    1234 user   12u"
  });

  assert.match(diagnostics, /port 8080/i);
  assert.match(diagnostics, /lsof -nP -iTCP:8080 -sTCP:LISTEN/i);
  assert.match(diagnostics, /ss -ltnp 'sport = :8080'/i);
  assert.match(diagnostics, /Health probe response on occupied port:/);
  assert.match(diagnostics, /Port usage hint:/);
  assert.match(diagnostics, /COMMAND\s+PID/i);
});
