import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApiFetchMock } from "./mockFetch";
import { renderApp } from "./renderApp";

describe("phase2 auth ux", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows register and login navigation when unauthenticated", async () => {
    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/"]);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start Wizard" })).toBeInTheDocument();
  });

  it("submits register request and shows check-email confirmation", async () => {
    const user = userEvent.setup();
    const trackingEvents = [];
    let registerRequestBody = null;
    const trackingHandler = (event) => trackingEvents.push(event.detail);
    window.addEventListener("tmb:tracking", trackingHandler);

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/register": ({ init }) => {
        registerRequestBody = JSON.parse(init.body);
        return {
          status: 200,
          body: { message: "If the email is valid, you will receive a link." }
        };
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/register?redirect=%2Fresult"]);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("Consent is required to create your account.")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(registerRequestBody).toEqual({
      email: "person@example.com",
      email_consent: true,
      signup_source: "register_page"
    });
    expect(
      trackingEvents.some((event) => event.eventName === "register_requested")
    ).toBe(true);
    window.removeEventListener("tmb:tracking", trackingHandler);
  });

  it("shows server-unavailable fallback for register 5xx", async () => {
    const user = userEvent.setup();

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/register": {
        status: 503,
        body: { message: "Mailer provider down" }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/register"]);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Server is unavailable. Please try again.")).toBeInTheDocument();
  });

  it("submits login request and shows check-email confirmation", async () => {
    const user = userEvent.setup();
    let loginRequestBody = null;

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/login/request": ({ init }) => {
        loginRequestBody = JSON.parse(init.body);
        return {
          status: 200,
          body: { message: "If the email is valid, you will receive a link." }
        };
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/login"]);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Send login link" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(loginRequestBody).toEqual({ email: "person@example.com" });
    const registerLinks = screen.getAllByRole("link", { name: "Register" });
    expect(
      registerLinks.some((link) =>
        String(link.getAttribute("href") || "").includes("email=person%40example.com")
      )
    ).toBe(true);
  });

  it("shows server-unavailable fallback for login network failures", async () => {
    const user = userEvent.setup();

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/login/request": () => {
        throw new TypeError("Failed to fetch");
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/login"]);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Send login link" }));

    expect(await screen.findByText("Server is unavailable. Please try again.")).toBeInTheDocument();
  });

  it("verifies token and redirects to intended route", async () => {
    const trackingEvents = [];
    const trackingHandler = (event) => trackingEvents.push(event.detail);
    window.addEventListener("tmb:tracking", trackingHandler);

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/login/verify": {
        status: 200,
        body: {
          user: {
            id: 77,
            email: "person@example.com"
          }
        }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/auth/verify?token=valid-token&redirect=%2Flogin"]);

    expect(await screen.findByText("You are already signed in")).toBeInTheDocument();
    expect(
      trackingEvents.some((event) => event.eventName === "verify_success")
    ).toBe(true);
    window.removeEventListener("tmb:tracking", trackingHandler);
  });

  it("shows verify failure state for invalid token", async () => {
    const trackingEvents = [];
    const trackingHandler = (event) => trackingEvents.push(event.detail);
    window.addEventListener("tmb:tracking", trackingHandler);

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/login/verify": {
        status: 400,
        body: { message: "This sign-in link is invalid or expired." }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/auth/verify?token=expired-token&redirect=%2Fwizard"]);

    expect(await screen.findByText("Could not sign you in")).toBeInTheDocument();
    expect(screen.getByText("This sign-in link is invalid or expired.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request another login link" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Fwizard"
    );
    expect(
      trackingEvents.some((event) => event.eventName === "verify_failure")
    ).toBe(true);
    window.removeEventListener("tmb:tracking", trackingHandler);
  });

  it("shows server-unavailable fallback for verify 5xx", async () => {
    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/login/verify": {
        status: 503,
        body: { message: "Provider unavailable" }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/auth/verify?token=valid-token&redirect=%2Fwizard"]);

    expect(await screen.findByText("Could not sign you in")).toBeInTheDocument();
    expect(screen.getByText("Server is unavailable. Please try again.")).toBeInTheDocument();
  });

  it("bootstraps authenticated user and logs out", async () => {
    const user = userEvent.setup();
    const trackingEvents = [];
    let authMeCalls = 0;
    const trackingHandler = (event) => trackingEvents.push(event.detail);
    window.addEventListener("tmb:tracking", trackingHandler);

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": () => {
        authMeCalls += 1;
        return {
          status: 200,
          body: {
            user: {
              id: 15,
              email: "member@example.com"
            }
          }
        };
      },
      "POST /api/auth/logout": {
        status: 204,
        body: null
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/"]);

    expect(await screen.findByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.getByText("member@example.com")).toBeInTheDocument();
    expect(authMeCalls).toBe(1);

    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    });
    expect(
      trackingEvents.some((event) => event.eventName === "logout")
    ).toBe(true);
    window.removeEventListener("tmb:tracking", trackingHandler);
  });

  it("keeps UI logged out even when logout request fails", async () => {
    const user = userEvent.setup();

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 200,
        body: {
          user: {
            id: 20,
            email: "member@example.com"
          }
        }
      },
      "POST /api/auth/logout": {
        status: 503,
        body: { message: "Session service unavailable" }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/"]);

    expect(await screen.findByRole("button", { name: "Logout" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    });
  });

  it("does not block wizard start when auth bootstrap fails", async () => {
    const user = userEvent.setup();

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": () => {
        throw new TypeError("Failed to fetch");
      },
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

    renderApp(["/"]);

    await user.click(screen.getByRole("link", { name: "Start Wizard" }));

    expect(await screen.findByRole("heading", { name: "Who are you?" })).toBeInTheDocument();
  });
});
