import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApiFetchMock } from "./mockFetch";
import { renderApp } from "./renderApp";

function unauthorizedMeHandler() {
  return {
    status: 401,
    body: {
      message: "Unauthorized"
    }
  };
}

describe("landing follow-the-build capture", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("renders the follow-the-build secondary capture without regressing primary CTA", async () => {
    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": unauthorizedMeHandler()
      })
    );

    renderApp(["/"]);

    expect(await screen.findByRole("heading", { name: /there are thousands of ai tools/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find my AI tool" })).toBeInTheDocument();
    expect(screen.getByText("Following the build?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get updates" })).toBeInTheDocument();
    expect(screen.getByText("Occasional updates only. No spam, no VC money, no agenda.")).toBeInTheDocument();
  });

  it("shows inline validation and avoids API submission for invalid email", async () => {
    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": unauthorizedMeHandler()
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderApp(["/"]);

    await screen.findByRole("heading", { name: /there are thousands of ai tools/i });

    await user.type(screen.getByPlaceholderText("you@example.com"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Get updates" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter a valid email to subscribe.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("submits to backend and shows success state", async () => {
    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": unauthorizedMeHandler(),
      "POST /api/follow-the-build/capture": ({ init }) => {
        const payload = JSON.parse(init.body);
        expect(payload.email).toBe("follow@example.com");
        expect(payload.email_consent).toBe(true);

        return {
          status: 201,
          body: {
            captured: true,
            created: true,
            user_id: 42,
            email: payload.email,
            signup_source: "follow_the_build"
          }
        };
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderApp(["/"]);

    await screen.findByRole("heading", { name: /there are thousands of ai tools/i });

    await user.type(screen.getByPlaceholderText("you@example.com"), "follow@example.com");
    await user.click(screen.getByRole("button", { name: "Get updates" }));

    expect(await screen.findByText("You're in. We'll keep you posted.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Get updates" })).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows backend error message when submission fails", async () => {
    vi.stubGlobal(
      "fetch",
      createApiFetchMock({
        "GET /api/auth/me": unauthorizedMeHandler(),
        "POST /api/follow-the-build/capture": {
          status: 500,
          body: {
            message: "Server unavailable"
          }
        }
      })
    );

    const user = userEvent.setup();
    renderApp(["/"]);

    await screen.findByRole("heading", { name: /there are thousands of ai tools/i });

    await user.type(screen.getByPlaceholderText("you@example.com"), "follow@example.com");
    await user.click(screen.getByRole("button", { name: "Get updates" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not subscribe right now. Please try again.");
  });
});
