export function parseCookies(headerValue) {
  const raw = String(headerValue || "");
  if (!raw) {
    return {};
  }

  return raw.split(";").reduce((accumulator, chunk) => {
    const [name, ...rest] = chunk.trim().split("=");
    if (!name) {
      return accumulator;
    }

    accumulator[name] = decodeURIComponent(rest.join("=") || "");
    return accumulator;
  }, {});
}

export function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAgeMs != null) {
    parts.push(`Max-Age=${Math.floor(options.maxAgeMs / 1000)}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
}

export function clearCookie(name, options = {}) {
  return serializeCookie(name, "", {
    ...options,
    maxAgeMs: 0
  });
}
