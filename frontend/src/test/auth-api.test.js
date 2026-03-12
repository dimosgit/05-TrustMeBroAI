import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyRecoveryAuth } from "../lib/api/authApi";

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

describe("authApi.verifyRecoveryAuth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deduplicates concurrent verify requests for the same token", async () => {
    let resolveFetch;
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    vi.stubGlobal("fetch", fetchMock);

    const first = verifyRecoveryAuth({ token: "same-token" });
    const second = verifyRecoveryAuth({ token: "same-token" });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(
      jsonResponse(200, {
        user: {
          id: 1,
          email: "same@example.com"
        },
        requires_passkey_enrollment: true
      })
    );

    const [firstPayload, secondPayload] = await Promise.all([first, second]);

    expect(firstPayload.user.email).toBe("same@example.com");
    expect(secondPayload.user.email).toBe("same@example.com");
    expect(firstPayload.requiresPasskeyEnrollment).toBe(true);
    expect(secondPayload.requiresPasskeyEnrollment).toBe(true);
  });

  it("does not cache completed verify requests", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        jsonResponse(200, {
          user: {
            id: 2,
            email: "fresh@example.com"
          }
        })
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    await verifyRecoveryAuth({ token: "fresh-token" });
    await verifyRecoveryAuth({ token: "fresh-token" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
