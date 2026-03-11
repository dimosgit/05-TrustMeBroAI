import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "../../src/app.js";
import { createMagicLinkProvider } from "../../src/services/magicLinkProvider.js";

function createMinimalConfig({ isProduction, providerMode }) {
  return {
    nodeEnv: isProduction ? "production" : "test",
    isProduction,
    port: 0,
    databaseUrl: "test",
    allowedOrigins: ["http://localhost:5174"],
    auth: {
      magicLinkTtlMs: 1000 * 60 * 15,
      magicLinkBaseUrl: "http://localhost:5174/auth/verify",
      magicLinkProvider: providerMode
    },
    session: {
      cookieName: "tmb_session",
      ttlMs: 1000 * 60 * 60
    },
    rateLimits: {
      auth: { windowMs: 60_000, max: 10 },
      authMe: { windowMs: 60_000, max: 60 },
      recommendationSession: { windowMs: 60_000, max: 30 },
      recommendationCompute: { windowMs: 60_000, max: 20 },
      recommendationUnlock: { windowMs: 60_000, max: 10 },
      recommendationFeedback: { windowMs: 60_000, max: 30 },
      recommendationTryItClick: { windowMs: 60_000, max: 30 }
    }
  };
}

test("createMagicLinkProvider rejects console mode in production", () => {
  assert.throws(
    () =>
      createMagicLinkProvider({
        mode: "console",
        isProduction: true,
        baseUrl: "https://app.example.com/auth/verify"
      }),
    /real magic-link provider/i
  );
});

test("createMagicLinkProvider resend mode requires credentials", () => {
  assert.throws(
    () =>
      createMagicLinkProvider({
        mode: "resend",
        isProduction: true,
        baseUrl: "https://app.example.com/auth/verify"
      }),
    /AUTH_MAGIC_LINK_RESEND_API_KEY/i
  );
});

test("createMagicLinkProvider resend mode invokes fetch with provider payload", async () => {
  const calls = [];
  const fetchStub = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      text: async () => ""
    };
  };

  const provider = createMagicLinkProvider({
    mode: "resend",
    isProduction: true,
    baseUrl: "https://app.example.com/auth/verify",
    resendApiKey: "re_test_key",
    fromEmail: "no-reply@example.com",
    fromName: "TrustMeBroAI",
    fetchImpl: fetchStub
  });

  const expiresAt = new Date("2026-03-11T12:00:00.000Z");
  await provider.sendMagicLink({
    email: "user@example.com",
    token: "plain-token",
    expiresAt,
    flow: "login"
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(calls[0].init.method, "POST");
  assert.ok(calls[0].init.headers.Authorization.includes("re_test_key"));

  const parsedBody = JSON.parse(calls[0].init.body);
  assert.equal(parsedBody.to[0], "user@example.com");
  assert.ok(parsedBody.html.includes("plain-token"));
});

test("app startup fails fast in production when provider mode is console", () => {
  assert.throws(
    () =>
      createApp({
        config: createMinimalConfig({
          isProduction: true,
          providerMode: "console"
        })
      }),
    /real magic-link provider/i
  );
});
