import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApiFetchMock } from "./mockFetch";
import { renderApp } from "./renderApp";

describe("phase2 sprint2 frontend", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("shows sign-in prompt when history is opened without auth", async () => {
    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 401,
          body: { message: "Unauthorized" }
        }
      })
    );

    renderApp(["/history"]);

    expect(await screen.findByTestId("history-signin-required")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Fhistory"
    );
  });

  it("renders empty authenticated history state", async () => {
    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 200,
          body: {
            user: {
              id: 81,
              email: "member@example.com"
            }
          }
        },
        "GET /api/recommendation/history": {
          status: 200,
          body: {
            items: []
          }
        }
      })
    );

    renderApp(["/history"]);

    expect(await screen.findByTestId("history-empty")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start wizard" })).toBeInTheDocument();
  });

  it("renders history loading state while request is in-flight", async () => {
    const fetchMock = vi.fn((input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const pathname = new URL(url, "http://localhost").pathname;
      const method = (init.method || "GET").toUpperCase();

      if (method === "GET" && pathname === "/api/auth/me") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user: {
                id: 82,
                email: "member@example.com"
              }
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          )
        );
      }

      if (method === "GET" && pathname === "/api/recommendation/history") {
        return new Promise(() => {});
      }

      return Promise.resolve(
        new Response(JSON.stringify({ message: `No mock for ${method} ${pathname}` }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        })
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/history"]);

    expect(await screen.findByTestId("history-loading")).toBeInTheDocument();
    expect(screen.getByText("Loading history...")).toBeInTheDocument();
  });

  it("renders non-empty history and opens a saved result", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 200,
          body: {
            user: {
              id: 91,
              email: "member@example.com"
            }
          }
        },
        "GET /api/recommendation/history": {
          status: 200,
          body: {
            items: [
              {
                session_id: 41,
                recommendation_id: 901,
                selected_priority: "Best quality",
                profile_name: "Developer",
                task_name: "Write code",
                created_at: "2026-03-12T12:00:00.000Z",
                primary_tool: {
                  tool_name: "ChatGPT",
                  try_it_url: "https://chatgpt.com"
                },
                primary_reason: "ChatGPT best matches quality-first coding tasks.",
                alternative_tools: [
                  { tool_name: "Claude", context_word: "reasoning" },
                  { tool_name: "Perplexity", context_word: "research" }
                ]
              }
            ]
          }
        }
      })
    );

    renderApp(["/history"]);

    expect(await screen.findByTestId("history-list")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("Developer · Write code")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open result" }));

    expect(await screen.findByTestId("unlocked-primary")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT best matches quality-first coding tasks.")).toBeInTheDocument();
  });

  it("renders history error state and supports retry", async () => {
    const user = userEvent.setup();
    let historyCalls = 0;

    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 200,
          body: {
            user: {
              id: 83,
              email: "member@example.com"
            }
          }
        },
        "GET /api/recommendation/history": () => {
          historyCalls += 1;

          if (historyCalls === 1) {
            return {
              status: 503,
              body: {
                message: "History service unavailable."
              }
            };
          }

          return {
            status: 200,
            body: {
              items: []
            }
          };
        }
      })
    );

    renderApp(["/history"]);

    expect(await screen.findByText("Could not load history right now.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(historyCalls).toBe(1);

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByTestId("history-empty")).toBeInTheDocument();
    expect(historyCalls).toBe(2);
  });

  it("shows passkey enrollment nudge after recovery verify when required", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 401,
          body: { message: "Unauthorized" }
        },
        "POST /api/auth/recovery/verify": {
          status: 200,
          body: {
            user: {
              id: 77,
              email: "person@example.com"
            },
            requires_passkey_enrollment: true
          }
        }
      })
    );

    renderApp(["/auth/recovery/verify?token=valid-token&redirect=%2F"]);

    const nudge = await screen.findByTestId("passkey-enrollment-nudge");
    expect(nudge).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add passkey" })).toHaveAttribute(
      "href",
      "/register?redirect=%2F&enroll=1"
    );

    await user.click(screen.getByRole("button", { name: "Later" }));
    expect(screen.queryByTestId("passkey-enrollment-nudge")).not.toBeInTheDocument();
  });

  it("does not render alternatives while authenticated auto-unlock is in progress", async () => {
    window.sessionStorage.setItem(
      "trustmebro.recommendation",
      JSON.stringify({
        sessionId: 44,
        recommendationId: 902,
        primaryTool: {
          toolName: "Hidden Tool",
          website: "https://example.com"
        },
        alternatives: [
          { toolName: "Alt One", contextWord: "free tier" },
          { toolName: "Alt Two", contextWord: "fast" }
        ],
        unlocked: false
      })
    );

    const fetchMock = vi.fn((input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const pathname = new URL(url, "http://localhost").pathname;
      const method = (init.method || "GET").toUpperCase();

      if (method === "GET" && pathname === "/api/auth/me") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              user: {
                id: 77,
                email: "person@example.com"
              }
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          )
        );
      }

      if (method === "POST" && pathname === "/api/recommendation/unlock") {
        return new Promise(() => {});
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

    expect(await screen.findByTestId("auto-unlock-pending")).toBeInTheDocument();
    expect(screen.queryByTestId("locked-primary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("alternatives-section")).not.toBeInTheDocument();
  });

  it("keeps active English copy unchanged after extraction", async () => {
    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 401,
          body: { message: "Unauthorized" }
        }
      })
    );

    renderApp(["/"]);

    expect(
      await screen.findByRole("heading", {
        name: "There are thousands of AI tools. We tell you exactly which one to use."
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find my AI tool" })).toBeInTheDocument();
    expect(
      screen.getByText("Answer 3 quick questions. Get your best match in under 60 seconds.")
    ).toBeInTheDocument();
  });
});
