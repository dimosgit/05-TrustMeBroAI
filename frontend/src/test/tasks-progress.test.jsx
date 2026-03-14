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
    vi.unstubAllEnvs();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("does not expose tasks-progress route by default", async () => {
    renderApp(["/tasks-progress"]);

    expect(await screen.findByRole("heading", { name: /there are thousands of ai tools/i })).toBeInTheDocument();
    expect(screen.queryByTestId("tasks-progress-page")).not.toBeInTheDocument();
  });

  it("renders the internal tasks progress page when explicitly enabled", async () => {
    vi.stubEnv("VITE_ENABLE_INTERNAL_ROUTES", "true");
    renderApp(["/tasks-progress"]);

    expect(await screen.findByTestId("tasks-progress-page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tasks progress" })).toBeInTheDocument();
    expect(screen.getByText("Phase 2 Sprint 3 Growth and Recommendation Data Foundation")).toBeInTheDocument();
    expect(screen.getAllByText("P0").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[ ] To do").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[~] In progress").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[x] Done").length).toBeGreaterThan(0);
    expect(
      screen.getByText("This route is for development visibility only. It must be deleted or disabled before go-live.")
    ).toBeInTheDocument();
  });
});
