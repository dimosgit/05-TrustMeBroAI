import { t } from "../../lib/i18n";

function decodeBase64Url(value) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeBase64Url(value) {
  if (!value) {
    return "";
  }

  const bytes = value instanceof Uint8Array
    ? value
    : value instanceof ArrayBuffer
      ? new Uint8Array(value)
      : new Uint8Array(value.buffer, value.byteOffset || 0, value.byteLength || value.length || 0);

  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function mapDescriptor(descriptor) {
  if (!descriptor) {
    return descriptor;
  }

  return {
    ...descriptor,
    id: decodeBase64Url(descriptor.id)
  };
}

function mapCreationOptions(options) {
  if (!options) {
    return options;
  }

  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    user: options.user
      ? {
          ...options.user,
          id: decodeBase64Url(options.user.id)
        }
      : options.user,
    excludeCredentials: Array.isArray(options.excludeCredentials)
      ? options.excludeCredentials.map(mapDescriptor)
      : options.excludeCredentials
  };
}

function mapRequestOptions(options) {
  if (!options) {
    return options;
  }

  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    allowCredentials: Array.isArray(options.allowCredentials)
      ? options.allowCredentials.map(mapDescriptor)
      : options.allowCredentials
  };
}

function serializeCredentialBase(credential) {
  return {
    id: credential.id,
    type: credential.type,
    rawId: encodeBase64Url(credential.rawId)
  };
}

function serializeRegistrationCredential(credential) {
  return {
    ...serializeCredentialBase(credential),
    response: {
      clientDataJSON: encodeBase64Url(credential.response.clientDataJSON),
      attestationObject: encodeBase64Url(credential.response.attestationObject),
      transports: typeof credential.response.getTransports === "function"
        ? credential.response.getTransports()
        : []
    }
  };
}

function serializeAuthenticationCredential(credential) {
  return {
    ...serializeCredentialBase(credential),
    response: {
      clientDataJSON: encodeBase64Url(credential.response.clientDataJSON),
      authenticatorData: encodeBase64Url(credential.response.authenticatorData),
      signature: encodeBase64Url(credential.response.signature),
      userHandle: credential.response.userHandle
        ? encodeBase64Url(credential.response.userHandle)
        : null
    }
  };
}

function isIosSafariBrowser() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator?.userAgent || "";
  const platform = window.navigator?.platform || "";
  const touchPoints = window.navigator?.maxTouchPoints || 0;
  const isIosDevice = /iPad|iPhone|iPod/i.test(userAgent) || (platform === "MacIntel" && touchPoints > 1);
  const isSafariWebKit =
    /WebKit/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|YaBrowser/i.test(userAgent);

  return isIosDevice && isSafariWebKit;
}

function normalizeIosSafariViewportAfterPasskey() {
  if (typeof window === "undefined" || typeof document === "undefined" || !isIosSafariBrowser()) {
    return;
  }

  if (document.activeElement instanceof HTMLElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur();
  }

  window.requestAnimationFrame(() => {
    window.scrollTo(window.scrollX, window.scrollY);
  });
}

export function isPasskeySupported() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    window.PublicKeyCredential &&
      navigator.credentials &&
      typeof navigator.credentials.create === "function" &&
      typeof navigator.credentials.get === "function"
  );
}

export async function createPasskeyCredential(options) {
  if (!isPasskeySupported()) {
    throw new Error(t("auth.passkeyUnsupported"));
  }

  normalizeIosSafariViewportAfterPasskey();
  let credential = null;

  try {
    credential = await navigator.credentials.create({
      publicKey: mapCreationOptions(options)
    });
  } finally {
    normalizeIosSafariViewportAfterPasskey();
  }

  if (!credential) {
    throw new Error(t("auth.passkeyCreationCancelled"));
  }

  return serializeRegistrationCredential(credential);
}

export async function getPasskeyCredential(options) {
  if (!isPasskeySupported()) {
    throw new Error(t("auth.passkeyUnsupported"));
  }

  normalizeIosSafariViewportAfterPasskey();
  let credential = null;

  try {
    credential = await navigator.credentials.get({
      publicKey: mapRequestOptions(options)
    });
  } finally {
    normalizeIosSafariViewportAfterPasskey();
  }

  if (!credential) {
    throw new Error(t("auth.passkeySigninCancelled"));
  }

  return serializeAuthenticationCredential(credential);
}
