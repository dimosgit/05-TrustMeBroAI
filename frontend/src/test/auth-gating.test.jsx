import { screen, waitFor } from "@testing-library/react";
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

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
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

    expect(fetchMock).not.toHaveBeenCalled();
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

  it("auto-unlocks for returning registered users without requiring email input", async () => {
    setLockedResultInSessionStorage({ recommendationId: 955, sessionId: 19 });
    window.localStorage.setItem("trustmebro.registered_unlock", "1");

    let unlockRequestBody = null;

    const fetchMock = createApiFetchMock({
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
});
