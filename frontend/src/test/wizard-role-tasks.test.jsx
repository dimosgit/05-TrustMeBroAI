import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApiFetchMock } from "./mockFetch";
import { renderApp } from "./renderApp";

describe("wizard role-specific tasks", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a curated step-2 task list for the selected role", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/profiles": {
          status: 200,
          body: [
            { id: 1, name: "Business", description: "Business workflows" },
            { id: 2, name: "Developer", description: "Developer workflows" }
          ]
        },
        "GET /api/tasks": {
          status: 200,
          body: [
            { id: 1, name: "Analyze a PDF", description: "Extract key insights from PDF files quickly" },
            { id: 2, name: "Write content", description: "Draft marketing, social, or long-form writing" },
            { id: 3, name: "Write code", description: "Generate and improve code quickly" },
            { id: 4, name: "Build an app", description: "Plan and implement software products end-to-end" },
            { id: 5, name: "Create images", description: "Generate and iterate visual assets" }
          ]
        },
        "GET /api/priorities": {
          status: 200,
          body: [{ id: 1, name: "Best quality", description: "Quality first" }]
        }
      })
    );

    renderApp(["/wizard"]);

    await user.click(await screen.findByRole("button", { name: /Developer/i }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("button", { name: /Write code/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Build an app/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Analyze a PDF/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Create images/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getByRole("button", { name: /Business/i }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("button", { name: /Analyze a PDF/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Write content/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Write code/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Build an app/i })).not.toBeInTheDocument();
  });

  it("falls back to the available catalog if a role-specific mapping has no matches", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/profiles": {
          status: 200,
          body: [{ id: 2, name: "Developer", description: "Developer workflows" }]
        },
        "GET /api/tasks": {
          status: 200,
          body: [{ id: 9, name: "Analyze a PDF", description: "Extract key insights from PDF files quickly" }]
        },
        "GET /api/priorities": {
          status: 200,
          body: [{ id: 1, name: "Best quality", description: "Quality first" }]
        }
      })
    );

    renderApp(["/wizard"]);

    await user.click(await screen.findByRole("button", { name: /Developer/i }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("button", { name: /Analyze a PDF/i })).toBeInTheDocument();
  });
});
