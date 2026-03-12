import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_COPY } from "../features/wizard/constants";
import { createApiFetchMock } from "./mockFetch";
import { renderApp } from "./renderApp";

const STORAGE_KEY = "trustmebro.recommendation";

function setLockedResultInSessionStorage(overrides = {}) {
  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      sessionId: 10,
      recommendationId: 44,
      primaryTool: {
        toolName: "Hidden Tool",
        website: "https://example.com"
      },
      alternatives: [
        { toolName: "Alt One", contextWord: "free tier" },
        { toolName: "Alt Two", contextWord: "fast" }
      ],
      unlocked: false,
      ...overrides
    })
  );
}

function createAbortError() {
  const error = new Error("Aborted");
  error.name = "AbortError";
  return error;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("phase1 conversion flow", () => {
  it("renders locked primary and exactly two alternatives after wizard submit", async () => {
    const user = userEvent.setup();

    const fetchMock = createApiFetchMock({
      "GET /api/profiles": {
        status: 200,
        body: [{ id: 2, name: "Developer", description: "Build products" }]
      },
      "GET /api/tasks": {
        status: 200,
        body: [{ id: 4, name: "Write code", description: "Ship code" }]
      },
      "GET /api/priorities": {
        status: 200,
        body: [{ id: 1, name: "Best quality", description: "Quality first" }]
      },
      "POST /api/recommendation/session": { status: 201, body: { session_id: 55 } },
      "POST /api/recommendation/compute": {
        status: 200,
        body: {
          session_id: 55,
          recommendation_id: 77,
          primary_tool: {
            tool_name: "ChatGPT",
            website: "https://chatgpt.com"
          },
          alternative_tools: [
            { tool_name: "Claude", context_word: "reasoning" },
            { tool_name: "Perplexity", context_word: "research" },
            { tool_name: "Copilot", context_word: "coding" }
          ]
        }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/wizard"]);

    await user.click(await screen.findByRole("button", { name: /Developer/i }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: /Write code/i }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: /Best quality/i }));
    await user.click(screen.getByRole("button", { name: "See recommendation" }));

    expect(
      await screen.findByText("Enter your email to reveal your best match.", {}, { timeout: 4000 })
    ).toBeInTheDocument();

    expect(screen.getByTestId("locked-primary")).toBeInTheDocument();
    expect(screen.getAllByTestId("alternative-item")).toHaveLength(2);
    expect(screen.queryByText("ChatGPT")).not.toBeInTheDocument();
    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
  });

  it("keeps primary recommendation section above alternatives in locked and unlocked result states", async () => {
    setLockedResultInSessionStorage({ recommendationId: 501, sessionId: 88 });
    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 401,
          body: { message: "Unauthorized" }
        }
      })
    );

    const { unmount } = renderApp(["/result"]);

    const lockedPrimary = await screen.findByTestId("locked-primary");
    const lockedAlternatives = await screen.findByTestId("alternatives-section");
    expect(
      Boolean(lockedPrimary.compareDocumentPosition(lockedAlternatives) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);

    unmount();
    vi.unstubAllGlobals();

    setLockedResultInSessionStorage({
      recommendationId: 502,
      sessionId: 89,
      unlocked: true,
      primaryTool: {
        toolName: "Claude",
        tryItUrl: "https://try.example.com/claude",
        website: "https://claude.ai"
      },
      primaryReason: "Claude best matches the selected criteria."
    });
    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 200,
          body: {
            user: {
              id: 77,
              email: "member@example.com"
            }
          }
        }
      })
    );

    renderApp(["/result"]);

    const unlockedPrimary = await screen.findByTestId("unlocked-primary");
    const unlockedAlternatives = await screen.findByTestId("alternatives-section");
    expect(
      Boolean(unlockedPrimary.compareDocumentPosition(unlockedAlternatives) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);
  });

  it("keeps the primary recommendation section ahead of alternatives", async () => {
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 502, sessionId: 70 });

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          recommendation_id: 502,
          session_id: 70,
          primary_tool: {
            tool_name: "ChatGPT",
            website: "https://chatgpt.com"
          },
          primary_reason: "Best for your task."
        }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    const lockedPrimary = await screen.findByTestId("locked-primary");
    const alternatives = screen.getByTestId("alternatives-section");
    expect(
      lockedPrimary.compareDocumentPosition(alternatives) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    const unlockedPrimary = await screen.findByTestId("unlocked-primary");
    expect(
      unlockedPrimary.compareDocumentPosition(alternatives) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("requires consent before unlock request", async () => {
    const user = userEvent.setup();
    setLockedResultInSessionStorage();

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          recommendation_id: 44,
          primary_tool: {
            tool_name: "ChatGPT",
            website: "https://chatgpt.com"
          },
          primary_reason: "Best for your task."
        }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    expect(
      await screen.findByText("Consent is required to unlock your recommendation.")
    ).toBeInTheDocument();

    const unlockCalls = fetchMock.mock.calls.filter(([input]) => {
      const url = typeof input === "string" ? input : input.url;
      return url.includes("/api/recommendation/unlock");
    });
    expect(unlockCalls).toHaveLength(0);
  });

  it("unlocks primary card and uses referral_url for Try it", async () => {
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 99 });

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          recommendation_id: 99,
          primary_tool: {
            tool_name: "ChatGPT",
            logo_url: "https://cdn.example.com/chatgpt.png",
            referral_url: "https://ref.example.com/chatgpt",
            website: "https://chatgpt.com"
          },
          primary_reason: "ChatGPT is the best fit for coding when quality is what matters most."
        }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    expect(await screen.findByTestId("unlocked-primary")).toBeInTheDocument();
    const tryItLink = screen.getByRole("link", { name: "Try it ->" });
    expect(tryItLink).toHaveAttribute("href", "https://ref.example.com/chatgpt");
  });

  it("renders a ChatGPT fallback mark when logo_url is missing", async () => {
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 205 });

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          recommendation_id: 205,
          primary_tool: {
            tool_name: "ChatGPT",
            website: "https://chatgpt.com"
          },
          primary_reason: "ChatGPT is the best fit for coding."
        }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    expect(await screen.findByLabelText("ChatGPT logo fallback")).toBeInTheDocument();
    expect(screen.getByText("✺")).toBeInTheDocument();
  });

  it("supports backend unlock payload shape with try_it_url and nested primary_reason", async () => {
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 301 });

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          recommendation: {
            id: 301,
            primary_reason: "ChatGPT is the best fit for coding when quality is what matters most.",
            try_it_url: "https://ref.example.com/chatgpt",
            primary_tool: {
              tool_name: "ChatGPT",
              logo_url: "https://cdn.example.com/chatgpt.png"
            }
          }
        }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    expect(await screen.findByTestId("unlocked-primary")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT is the best fit for coding when quality is what matters most.")).toBeInTheDocument();

    const tryItLink = screen.getByRole("link", { name: "Try it ->" });
    expect(tryItLink).toHaveAttribute("href", "https://ref.example.com/chatgpt");
  });

  it("times out a hanging unlock request, resets loading, and shows recoverable error", async () => {
    vi.stubEnv("VITE_UNLOCK_TIMEOUT_MS", "50");
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 711, sessionId: 21 });

    const fetchMock = vi.fn((input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const pathname = new URL(url, "http://localhost").pathname;
      const method = (init.method || "GET").toUpperCase();

      if (method === "POST" && pathname === "/api/recommendation/unlock") {
        return new Promise((_, reject) => {
          const abortUnlock = () => reject(createAbortError());
          if (init.signal?.aborted) {
            abortUnlock();
            return;
          }
          init.signal?.addEventListener("abort", abortUnlock, { once: true });
        });
      }

      return Promise.resolve(
        new Response(JSON.stringify({ message: `No mock for ${method} ${pathname}` }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        })
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    expect(screen.getByRole("button", { name: "Unlocking..." })).toBeDisabled();

    expect(await screen.findByText("Server is unavailable. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unlock my best match" })).toBeEnabled();
  });

  it("recovers from unlock 5xx failure and allows retry", async () => {
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 722, sessionId: 22 });

    let unlockAttempts = 0;

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": () => {
        unlockAttempts += 1;

        if (unlockAttempts === 1) {
          return {
            status: 503,
            body: { message: "Service temporarily unavailable." }
          };
        }

        return {
          status: 200,
          body: {
            recommendation_id: 722,
            session_id: 22,
            primary_tool: {
              tool_name: "Claude",
              try_it_url: "https://try.example.com/claude"
            },
            primary_reason: "Claude is the best fit for your use case."
          }
        };
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    expect(await screen.findByText("Server is unavailable. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unlock my best match" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    expect(await screen.findByTestId("unlocked-primary")).toBeInTheDocument();
    expect(unlockAttempts).toBe(2);
  });

  it("falls back to website and submits thumbs_up feedback signal", async () => {
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 144 });

    let feedbackRequestBody = null;

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          recommendation_id: 144,
          primary_tool: {
            tool_name: "Claude",
            website: "https://claude.ai"
          },
          primary_reason: "Claude is the best fit for your use case."
        }
      },
      "POST /api/recommendation/144/feedback": ({ init }) => {
        feedbackRequestBody = JSON.parse(init.body);
        return {
          status: 201,
          body: {
            id: 1,
            recommendation_id: 144,
            signal: 1
          }
        };
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    const tryItLink = await screen.findByRole("link", { name: "Try it ->" });
    expect(tryItLink).toHaveAttribute("href", "https://claude.ai");

    await user.click(screen.getByRole("button", { name: "Thumbs up" }));

    await waitFor(() => {
      expect(feedbackRequestBody).toEqual({ signal: 1 });
    });
  });

  it("shows post-unlock account callout for anonymous users", async () => {
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 188 });

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          recommendation_id: 188,
          primary_tool: {
            tool_name: "Claude",
            website: "https://claude.ai"
          },
          primary_reason: "Claude is the best fit for your use case."
        }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    expect(await screen.findByText("Create an account to save and return later.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/register?redirect=%2Fresult&email=user%40example.com"
    );
  });

  it("uses only one top priority in session payload", async () => {
    const user = userEvent.setup();
    let sessionPayload = null;
    const trackingEvents = [];
    const trackingHandler = (event) => trackingEvents.push(event.detail);
    window.addEventListener("tmb:tracking", trackingHandler);

    const fetchMock = createApiFetchMock({
      "GET /api/profiles": {
        status: 200,
        body: [{ id: 2, name: "Developer", description: "Build products" }]
      },
      "GET /api/tasks": {
        status: 200,
        body: [{ id: 4, name: "Write code", description: "Ship code" }]
      },
      "GET /api/priorities": {
        status: 200,
        body: [
          { id: 1, name: "Best quality", description: "Quality" },
          { id: 2, name: "Fastest results", description: "Speed" }
        ]
      },
      "POST /api/recommendation/session": ({ init }) => {
        sessionPayload = JSON.parse(init.body);
        return { status: 201, body: { session_id: 88 } };
      },
      "POST /api/recommendation/compute": {
        status: 200,
        body: {
          session_id: 88,
          recommendation_id: 99,
          primary_tool: { tool_name: "ChatGPT" },
          alternative_tools: [
            { tool_name: "Claude", context_word: "quality" },
            { tool_name: "Perplexity", context_word: "research" }
          ]
        }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/wizard"]);

    await user.click(await screen.findByRole("button", { name: /Developer/i }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: /Write code/i }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: /Fastest results/i }));
    await user.click(screen.getByRole("button", { name: "See recommendation" }));

    await screen.findByTestId("locked-primary", {}, { timeout: 4000 });

    expect(sessionPayload.selected_priority).toBe("Fastest results");
    expect(sessionPayload.selected_priorities).toEqual(["Fastest results"]);
    expect(sessionPayload.wizard_duration_seconds).toEqual(expect.any(Number));
    expect(
      trackingEvents.some(
        (event) =>
          event.eventName === "wizard_completed" &&
          event.payload.selected_priority === "Fastest results"
      )
    ).toBe(true);

    window.removeEventListener("tmb:tracking", trackingHandler);
  });

  it("keeps wizard navigation actions persistently discoverable on mobile-sized steps", async () => {
    const user = userEvent.setup();

    const fetchMock = createApiFetchMock({
      "GET /api/profiles": {
        status: 200,
        body: [{ id: 2, name: "Developer", description: "Build products" }]
      },
      "GET /api/tasks": {
        status: 200,
        body: [{ id: 4, name: "Write code", description: "Ship code" }]
      },
      "GET /api/priorities": {
        status: 200,
        body: [{ id: 1, name: "Best quality", description: "Quality first" }]
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/wizard"]);

    const profileActions = await screen.findByTestId("wizard-action-bar");
    expect(profileActions.className).toContain("sticky");
    expect(within(profileActions).getByRole("button", { name: "Continue" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Developer/i }));
    await user.click(within(profileActions).getByRole("button", { name: "Continue" }));

    const taskActions = await screen.findByTestId("wizard-action-bar");
    expect(within(taskActions).getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(within(taskActions).getByRole("button", { name: "Continue" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Write code/i }));
    await user.click(within(taskActions).getByRole("button", { name: "Continue" }));

    const priorityActions = await screen.findByTestId("wizard-action-bar");
    expect(within(priorityActions).getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(
      within(priorityActions).getByRole("button", { name: "See recommendation" })
    ).toBeInTheDocument();
  });

  it("renders required consent copy", () => {
    setLockedResultInSessionStorage();
    vi.stubGlobal("fetch", createApiFetchMock({}));

    renderApp(["/result"]);

    expect(screen.getByText(CONSENT_COPY)).toBeInTheDocument();
  });

  it("emits unlock and try-it tracking events", async () => {
    const user = userEvent.setup();
    const trackingEvents = [];
    let tryItRequestBody = null;
    const trackingHandler = (event) => trackingEvents.push(event.detail);
    window.addEventListener("tmb:tracking", trackingHandler);

    setLockedResultInSessionStorage({ recommendationId: 911, sessionId: 41 });

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          recommendation_id: 911,
          primary_tool: {
            tool_name: "Claude",
            try_it_url: "https://try.example.com/claude",
            website: "https://claude.ai"
          },
          primary_reason: "Claude is the best fit for your use case."
        }
      },
      "POST /api/recommendation/911/try-it-click": ({ init }) => {
        tryItRequestBody = JSON.parse(init.body);
        return {
          status: 201,
          body: {
            id: 51,
            recommendation_id: 911,
            session_id: 41
          }
        };
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    const tryItLink = await screen.findByRole("link", { name: "Try it ->" });
    await user.click(tryItLink);

    expect(
      trackingEvents.some((event) => event.eventName === "recommendation_unlocked")
    ).toBe(true);
    expect(
      trackingEvents.some(
        (event) =>
          event.eventName === "try_it_clicked" &&
          event.payload.try_it_url === "https://try.example.com/claude"
      )
    ).toBe(true);
    expect(tryItRequestBody).toEqual({ session_id: 41 });

    window.removeEventListener("tmb:tracking", trackingHandler);
  });

  it("uses unlock response session_id for try-it tracking when stored state misses it", async () => {
    const user = userEvent.setup();
    let tryItRequestBody = null;

    setLockedResultInSessionStorage({ recommendationId: 933, sessionId: null });

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 200,
        body: {
          session_id: 73,
          recommendation_id: 933,
          primary_tool: {
            tool_name: "Perplexity",
            try_it_url: "https://try.example.com/perplexity",
            website: "https://perplexity.ai"
          },
          primary_reason: "Perplexity is the best fit for fast research."
        }
      },
      "POST /api/recommendation/933/try-it-click": ({ init }) => {
        tryItRequestBody = JSON.parse(init.body);
        return {
          status: 201,
          body: {
            id: 71,
            recommendation_id: 933,
            session_id: 73
          }
        };
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Unlock my best match" }));

    const tryItLink = await screen.findByRole("link", { name: "Try it ->" });
    await user.click(tryItLink);

    expect(tryItRequestBody).toEqual({ session_id: 73 });
  });

  it("auto-unlocks for authenticated users without requiring email input", async () => {
    setLockedResultInSessionStorage({ recommendationId: 955, sessionId: 19 });

    let unlockRequestBody = null;

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 200,
        body: {
          user: {
            id: 101,
            email: "member@example.com"
          }
        }
      },
      "POST /api/recommendation/unlock": ({ init }) => {
        unlockRequestBody = JSON.parse(init.body);
        return {
          status: 200,
          body: {
            session_id: 19,
            recommendation_id: 955,
            primary_tool: {
              tool_name: "Claude",
              try_it_url: "https://try.example.com/claude"
            },
            primary_reason: "Claude is the best fit for your use case."
          }
        };
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    expect(await screen.findByTestId("unlocked-primary")).toBeInTheDocument();
    expect(screen.queryByText("Email to unlock")).not.toBeInTheDocument();
    expect(unlockRequestBody).toEqual({
      session_id: 19,
      recommendation_id: 955,
      signup_source: "landing"
    });
  });

  it("does not block manual unlock while auto-unlock attempt is in flight", async () => {
    vi.stubEnv("VITE_UNLOCK_TIMEOUT_MS", "100");
    const user = userEvent.setup();
    setLockedResultInSessionStorage({ recommendationId: 977, sessionId: 39 });
    window.localStorage.setItem("trustmebro.registered_unlock", "1");

    let unlockAttempts = 0;

    const fetchMock = vi.fn((input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const pathname = new URL(url, "http://localhost").pathname;
      const method = (init.method || "GET").toUpperCase();

      if (method === "POST" && pathname === "/api/recommendation/unlock") {
        unlockAttempts += 1;

        if (unlockAttempts === 1) {
          return new Promise((_, reject) => {
            const abortUnlock = () => reject(createAbortError());
            if (init.signal?.aborted) {
              abortUnlock();
              return;
            }
            init.signal?.addEventListener("abort", abortUnlock, { once: true });
          });
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              session_id: 39,
              recommendation_id: 977,
              primary_tool: {
                tool_name: "Claude",
                try_it_url: "https://try.example.com/claude"
              },
              primary_reason: "Claude is the best fit for your use case."
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          )
        );
      }

      return Promise.resolve(
        new Response(JSON.stringify({ message: `No mock for ${method} ${pathname}` }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        })
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    const unlockButton = await screen.findByRole("button", { name: "Unlock my best match" });
    expect(unlockButton).toBeEnabled();

    await user.type(screen.getByLabelText("Email to unlock"), "user@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(unlockButton);

    expect(await screen.findByTestId("unlocked-primary")).toBeInTheDocument();
    expect(unlockAttempts).toBeGreaterThanOrEqual(2);
  });

  it("recovers from auto-unlock failure and re-enables manual unlock", async () => {
    setLockedResultInSessionStorage({ recommendationId: 966, sessionId: 29 });
    window.localStorage.setItem("trustmebro.registered_unlock", "1");

    const fetchMock = createApiFetchMock({
      "POST /api/recommendation/unlock": {
        status: 503,
        body: { message: "Service unavailable." }
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/result"]);

    expect(await screen.findByLabelText("Email to unlock")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Unlock my best match" })).toBeEnabled();
    });
    expect(window.localStorage.getItem("trustmebro.registered_unlock")).toBeNull();
  });
});
