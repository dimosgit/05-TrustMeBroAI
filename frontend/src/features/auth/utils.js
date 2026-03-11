const DEFAULT_REDIRECT_PATH = "/wizard";

export function sanitizeRedirectPath(rawPath) {
  if (typeof rawPath !== "string" || !rawPath.startsWith("/") || rawPath.startsWith("//")) {
    return DEFAULT_REDIRECT_PATH;
  }

  return rawPath;
}

export function isValidEmailAddress(value) {
  if (typeof value !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
