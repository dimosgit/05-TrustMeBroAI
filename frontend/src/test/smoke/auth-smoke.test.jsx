import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createApiFetchMock } from "../mockFetch";
import { renderApp } from "../renderApp";

describe("anonymous wizard smoke", () => {
  it("allows starting wizard without login", async () => {
    const user = userEvent.setup();

    const fetchMock = createApiFetchMock({
      "GET /api/profiles": {
        status: 200,
        body: [{ id: 1, name: "Business", description: "Business tasks" }]
      },
      "GET /api/tasks": {
        status: 200,
        body: [{ id: 1, name: "Analyze a PDF", description: "PDF tasks" }]
      },
      "GET /api/priorities": {
        status: 200,
        body: [{ id: 1, name: "Best quality", description: "Quality first" }]
      }
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/"]);

    await user.click(screen.getByRole("button", { name: "Find my AI tool" }));

    expect(await screen.findByRole("heading", { name: "Who are you?" })).toBeInTheDocument();
    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });
});
