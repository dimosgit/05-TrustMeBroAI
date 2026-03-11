const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class ApiTimeoutError extends ApiError {
  constructor(message = "Request timed out", data = null) {
    super(message, 408, data);
    this.name = "ApiTimeoutError";
  }
}

export class ApiNetworkError extends ApiError {
  constructor(message = "Server is unavailable. Please try again.", data = null) {
    super(message, 0, data);
    this.name = "ApiNetworkError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", data = null) {
    super(message, 401, data);
    this.name = "UnauthorizedError";
  }
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function buildUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(path, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    signal,
    timeoutMs,
    allowUnauthorized = false
  } = options;

  const hasJsonBody = body !== undefined && body !== null;
  const hasTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0;
  const timeoutController = hasTimeout ? new AbortController() : null;
  const requestSignal = timeoutController ? timeoutController.signal : signal;

  let didTimeout = false;
  let timeoutId = null;
  let cleanupForwardAbort = null;

  if (timeoutController) {
    timeoutId = globalThis.setTimeout(() => {
      didTimeout = true;
      timeoutController.abort();
    }, timeoutMs);

    if (signal) {
      if (signal.aborted) {
        timeoutController.abort();
      } else {
        const forwardAbort = () => timeoutController.abort();
        signal.addEventListener("abort", forwardAbort, { once: true });
        cleanupForwardAbort = () => signal.removeEventListener("abort", forwardAbort);
      }
    }
  }

  let response;
  let data;

  try {
    response = await fetch(buildUrl(path), {
      method,
      credentials: "include",
      headers: {
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...headers
      },
      body: hasJsonBody ? JSON.stringify(body) : undefined,
      signal: requestSignal
    });
    data = await parseResponseBody(response);

    if (response.status === 401) {
      if (allowUnauthorized) {
        return null;
      }

      throw new UnauthorizedError(data?.message || "Unauthorized", data);
    }

    if (!response.ok) {
      throw new ApiError(data?.message || "Request failed", response.status, data);
    }

    return data;
  } catch (error) {
    if (didTimeout) {
      throw new ApiTimeoutError("Server is unavailable. Please try again.");
    }

    if (error?.name === "AbortError") {
      throw new ApiNetworkError("Request was cancelled.");
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiNetworkError("Server is unavailable. Please try again.");
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
    if (cleanupForwardAbort) {
      cleanupForwardAbort();
    }
  }
}

export const apiClient = {
  get(path, options = {}) {
    return request(path, { ...options, method: "GET" });
  },
  post(path, body, options = {}) {
    return request(path, { ...options, method: "POST", body });
  }
};
