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

    await user.click(screen.getByRole("button", { name: "Open result" }));

    expect(await screen.findByTestId("unlocked-primary")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT best matches quality-first coding tasks.")).toBeInTheDocument();
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
