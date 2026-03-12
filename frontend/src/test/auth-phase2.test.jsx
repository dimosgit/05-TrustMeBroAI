import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApiFetchMock } from "./mockFetch";
import { renderApp } from "./renderApp";

function toBuffer(...values) {
  return new Uint8Array(values).buffer;
}

function createRegistrationCredential() {
  return {
    id: "registration-credential-id",
    type: "public-key",
    rawId: toBuffer(1, 2, 3, 4),
    response: {
      clientDataJSON: toBuffer(5, 6, 7),
      attestationObject: toBuffer(8, 9, 10),
      getTransports: () => ["internal"]
    }
  };
}

function createAuthenticationCredential() {
  return {
    id: "authentication-credential-id",
    type: "public-key",
    rawId: toBuffer(11, 12, 13, 14),
    response: {
      clientDataJSON: toBuffer(15, 16, 17),
      authenticatorData: toBuffer(18, 19, 20),
      signature: toBuffer(21, 22, 23),
      userHandle: null
    }
  };
}

function stubPasskeyApis({ createCredential, getCredential } = {}) {
  Object.defineProperty(window, "PublicKeyCredential", {
    value: class PublicKeyCredentialMock {},
    configurable: true
  });

  const createMock = vi.fn(async () =>
    createCredential !== undefined ? createCredential : createRegistrationCredential()
  );
  const getMock = vi.fn(async () =>
    getCredential !== undefined ? getCredential : createAuthenticationCredential()
  );

  Object.defineProperty(navigator, "credentials", {
    value: {
      create: createMock,
      get: getMock
    },
    configurable: true
  });

  return {
    createMock,
    getMock
  };
}

describe("phase2 auth ux", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a single account action when unauthenticated", async () => {
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

    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/login?redirect=%2F"
    );
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Start Wizard" })).not.toBeInTheDocument();
  });

  it("submits passkey registration flow and signs user in", async () => {
    const user = userEvent.setup();
    let registerOptionsBody = null;
    let registerVerifyBody = null;

    const { createMock } = stubPasskeyApis();

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/passkey/register/options": ({ init }) => {
        registerOptionsBody = JSON.parse(init.body);
        return {
          status: 200,
          body: {
            challenge_id: "register-challenge-1",
            public_key: {
              challenge: "AAECAw",
              rp: { name: "TrustMeBroAI", id: "localhost" },
              user: {
                id: "dXNlci0x",
                name: "person@example.com",
                displayName: "person@example.com"
              },
              pubKeyCredParams: [{ type: "public-key", alg: -7 }],
              timeout: 60000,
              attestation: "none"
            }
          }
        };
      },
      "POST /api/auth/passkey/register/verify": ({ init }) => {
        registerVerifyBody = JSON.parse(init.body);
        return {
          status: 200,
          body: {
            user: {
              id: 77,
              email: "person@example.com"
            }
          }
        };
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/register?redirect=%2Flogin"]);

    await user.type(screen.getByLabelText("Account email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Create account with passkey" }));
    expect(await screen.findByText("Consent is required to create your account.")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create account with passkey" }));

    expect(await screen.findByText("You are already signed in")).toBeInTheDocument();
    expect(registerOptionsBody).toEqual({
      email: "person@example.com",
      email_consent: true,
      signup_source: "register_page"
    });
    expect(registerVerifyBody.challenge_id).toBe("register-challenge-1");
    expect(registerVerifyBody.credential.id).toBe("registration-credential-id");
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("shows server-unavailable fallback for register options 5xx", async () => {
    const user = userEvent.setup();
    stubPasskeyApis();

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/passkey/register/options": {
        status: 503,
        body: { message: "Passkey provider down" }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/register"]);

    await user.type(screen.getByLabelText("Account email"), "person@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create account with passkey" }));

    expect(await screen.findByText("Server is unavailable. Please try again.")).toBeInTheDocument();
  });

  it("shows explicit cancellation message when passkey registration is cancelled", async () => {
    const user = userEvent.setup();
    stubPasskeyApis({ createCredential: null });

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/passkey/register/options": {
        status: 200,
        body: {
          challenge_id: "register-challenge-cancel",
          public_key: {
            challenge: "AAECAw",
            rp: { name: "TrustMeBroAI", id: "localhost" },
            user: {
              id: "dXNlci0x",
              name: "person@example.com",
              displayName: "person@example.com"
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            timeout: 60000,
            attestation: "none"
          }
        }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/register"]);

    await user.type(screen.getByLabelText("Account email"), "person@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create account with passkey" }));

    expect(await screen.findByText("Passkey creation was cancelled.")).toBeInTheDocument();
  });

  it("submits passkey sign-in flow and signs user in", async () => {
    const user = userEvent.setup();
    let loginOptionsBody = null;
    let loginVerifyBody = null;

    const { getMock } = stubPasskeyApis();

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/passkey/login/options": ({ init }) => {
        loginOptionsBody = JSON.parse(init.body);
        return {
          status: 200,
          body: {
            challenge_id: "login-challenge-1",
            public_key: {
              challenge: "BAUGBw",
              timeout: 60000,
              rpId: "localhost",
              userVerification: "preferred",
              allowCredentials: [{ id: "AQID", type: "public-key" }]
            }
          }
        };
      },
      "POST /api/auth/passkey/login/verify": ({ init }) => {
        loginVerifyBody = JSON.parse(init.body);
        return {
          status: 200,
          body: {
            user: {
              id: 88,
              email: "person@example.com"
            }
          }
        };
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/login?redirect=%2Flogin"]);

    await user.type(screen.getByLabelText("Account email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in with passkey" }));

    expect(await screen.findByText("You are already signed in")).toBeInTheDocument();
    expect(loginOptionsBody).toEqual({ email: "person@example.com" });
    expect(loginVerifyBody.challenge_id).toBe("login-challenge-1");
    expect(loginVerifyBody.credential.id).toBe("authentication-credential-id");
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it("shows browser-support fallback when passkeys are unavailable", async () => {
    const user = userEvent.setup();

    Object.defineProperty(window, "PublicKeyCredential", {
      value: undefined,
      configurable: true
    });

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/passkey/login/options": {
        status: 200,
        body: {
          challenge_id: "login-challenge-2",
          public_key: {
            challenge: "BAUGBw",
            timeout: 60000,
            rpId: "localhost",
            userVerification: "preferred"
          }
        }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/login"]);

    await user.type(screen.getByLabelText("Account email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in with passkey" }));

    expect(
      await screen.findByText("Passkeys are not supported on this browser. Use email recovery instead.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Use email recovery" })).toBeInTheDocument();
  });

  it("shows explicit cancellation message when passkey sign-in is cancelled", async () => {
    const user = userEvent.setup();
    stubPasskeyApis({ getCredential: null });

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/passkey/login/options": {
        status: 200,
        body: {
          challenge_id: "login-challenge-cancel",
          public_key: {
            challenge: "BAUGBw",
            timeout: 60000,
            rpId: "localhost",
            userVerification: "preferred"
          }
        }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/login"]);

    await user.type(screen.getByLabelText("Account email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in with passkey" }));

    expect(await screen.findByText("Passkey sign-in was cancelled.")).toBeInTheDocument();
  });

  it("submits recovery request and shows check-email confirmation", async () => {
    const user = userEvent.setup();
    let recoveryRequestBody = null;

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/recovery/request": ({ init }) => {
        recoveryRequestBody = JSON.parse(init.body);
        return {
          status: 202,
          body: { message: "If the email is valid, you will receive a recovery link." }
        };
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/auth/recovery?redirect=%2Fresult"]);

    await user.type(screen.getByLabelText("Account email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Send recovery email" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(recoveryRequestBody).toEqual({
      email: "person@example.com",
      redirect_path: "/result"
    });
  });

  it("verifies recovery token and redirects to intended route", async () => {
    const trackingEvents = [];
    const trackingHandler = (event) => trackingEvents.push(event.detail);
    window.addEventListener("tmb:tracking", trackingHandler);

    const fetchMock = createApiFetchMock({
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
          }
        }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/auth/recovery/verify?token=valid-token&redirect=%2Flogin"]);

    expect(await screen.findByText("You are already signed in")).toBeInTheDocument();
    expect(
      trackingEvents.some((event) => event.eventName === "recovery_verify_success")
    ).toBe(true);
    window.removeEventListener("tmb:tracking", trackingHandler);
  });

  it("shows verify failure state for invalid recovery token", async () => {
    const trackingEvents = [];
    const trackingHandler = (event) => trackingEvents.push(event.detail);
    window.addEventListener("tmb:tracking", trackingHandler);

    const fetchMock = createApiFetchMock({
      "GET /api/auth/me": {
        status: 401,
        body: { message: "Unauthorized" }
      },
      "POST /api/auth/recovery/verify": {
        status: 400,
        body: { message: "This recovery link is invalid or expired." }
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    renderApp(["/auth/recovery/verify?token=expired-token&redirect=%2Fwizard"]);

    expect(await screen.findByText("Could not sign you in")).toBeInTheDocument();
    expect(screen.getByText("This recovery link is invalid or expired.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request another recovery email" })).toHaveAttribute(
      "href",
      "/auth/recovery?redirect=%2Fwizard"
    );
    expect(
      trackingEvents.some((event) => event.eventName === "recovery_verify_failure")
    ).toBe(true);
    window.removeEventListener("tmb:tracking", trackingHandler);
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
      expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument();
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
      expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "Find my AI tool" }));

    expect(await screen.findByRole("heading", { name: "Who are you?" })).toBeInTheDocument();
  });
});
