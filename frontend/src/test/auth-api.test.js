import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyLoginAuth } from "../lib/api/authApi";

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

describe("authApi.verifyLoginAuth", () => {
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

    const first = verifyLoginAuth({ token: "same-token" });
    const second = verifyLoginAuth({ token: "same-token" });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(
      jsonResponse(200, {
        user: {
          id: 1,
          email: "same@example.com"
        }
      })
    );

    const [firstUser, secondUser] = await Promise.all([first, second]);

    expect(firstUser.email).toBe("same@example.com");
    expect(secondUser.email).toBe("same@example.com");
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

    await verifyLoginAuth({ token: "fresh-token" });
    await verifyLoginAuth({ token: "fresh-token" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
