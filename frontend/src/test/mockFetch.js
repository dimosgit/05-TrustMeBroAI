import { vi } from "vitest";

function buildResponse(status, body) {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function createApiFetchMock(handlers) {
  return vi.fn(async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    const pathname = new URL(url, "http://localhost").pathname;
    const method = (init.method || "GET").toUpperCase();
    const key = `${method} ${pathname}`;

    const handler = handlers[key];
    if (!handler) {
      return buildResponse(404, { message: `No mock for ${key}` });
    }

    const result = typeof handler === "function" ? await handler({ url, init }) : handler;

    if (result instanceof Response) {
      return result;
    }

    return buildResponse(result.status || 200, result.body);
  });
}
