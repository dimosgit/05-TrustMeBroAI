const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
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
    allowUnauthorized = false
  } = options;

  const hasJsonBody = body !== undefined && body !== null;

  const response = await fetch(buildUrl(path), {
    method,
    credentials: "include",
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...headers
    },
    body: hasJsonBody ? JSON.stringify(body) : undefined,
    signal
  });

  const data = await parseResponseBody(response);

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
}

export const apiClient = {
  get(path, options = {}) {
    return request(path, { ...options, method: "GET" });
  },
  post(path, body, options = {}) {
    return request(path, { ...options, method: "POST", body });
  }
};
