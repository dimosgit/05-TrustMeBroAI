import { ValidationError } from "../errors.js";
import { VALID_PRIORITIES } from "./scoring.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function assertValidEmail(email) {
  if (!email || email.length > 255 || !EMAIL_PATTERN.test(email)) {
    throw new ValidationError("A valid email is required");
  }
}

export function assertValidPassword(password) {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new ValidationError("Password must be between 8 and 128 characters");
  }
}

export function assertPositiveInteger(value, fieldName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

export function assertString(value, fieldName, maxLength = 255) {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new ValidationError(`${fieldName} is required`);
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`${fieldName} cannot exceed ${maxLength} characters`);
  }

  return normalized;
}

export function assertStringArray(value, fieldName, maxItems = 20) {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }

  if (value.length > maxItems) {
    throw new ValidationError(`${fieldName} cannot exceed ${maxItems} items`);
  }

  return value.map((item, index) => assertString(item, `${fieldName}[${index}]`, 120));
}

export function assertOptionalInteger(value, fieldName) {
  if (value == null) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative integer`);
  }

  return parsed;
}

export function assertValidPriority(value) {
  const priority = assertString(value, "selected_priority", 120);
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new ValidationError("selected_priority is invalid");
  }
  return priority;
}

export function parseOptionalString(value, maxLength = 100) {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError("signup_source must be a string");
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`signup_source cannot exceed ${maxLength} characters`);
  }

  return normalized;
}
