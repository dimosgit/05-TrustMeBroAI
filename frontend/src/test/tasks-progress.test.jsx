import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApiFetchMock } from "./mockFetch";
import { renderApp } from "./renderApp";

describe("tasks progress route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": {
          status: 401,
          body: { message: "Unauthorized" }
        }
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("renders the internal tasks progress page", async () => {
    renderApp(["/tasks-progress"]);

    expect(await screen.findByTestId("tasks-progress-page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tasks progress" })).toBeInTheDocument();
    expect(screen.getByText("Phase 2 Sprint 2 Product Foundation")).toBeInTheDocument();
    expect(
      screen.getByText("This route is for development visibility only. It must be deleted or disabled before go-live.")
    ).toBeInTheDocument();
  });
});
