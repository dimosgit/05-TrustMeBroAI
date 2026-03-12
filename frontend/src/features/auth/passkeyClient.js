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
    throw new Error("Passkeys are not supported on this browser. Use email recovery instead.");
  }

  const credential = await navigator.credentials.create({
    publicKey: mapCreationOptions(options)
  });

  if (!credential) {
    throw new Error("Passkey creation was cancelled.");
  }

  return serializeRegistrationCredential(credential);
}

export async function getPasskeyCredential(options) {
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported on this browser. Use email recovery instead.");
  }

  const credential = await navigator.credentials.get({
    publicKey: mapRequestOptions(options)
  });

  if (!credential) {
    throw new Error("Passkey sign-in was cancelled.");
  }

  return serializeAuthenticationCredential(credential);
}
