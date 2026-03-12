import { apiClient } from "./client";

const pendingVerifyRequestsByToken = new Map();

function normalizeUser(payload) {
  return payload?.user || null;
}

export async function requestPasskeyRegisterOptions({
  email,
  emailConsent,
  signupSource = "register_page"
}) {
  return apiClient.post("/auth/passkey/register/options", {
    email,
    email_consent: emailConsent,
    signup_source: signupSource
  });
}

export async function verifyPasskeyRegister({
  challengeId,
  credential
}) {
  const payload = await apiClient.post("/auth/passkey/register/verify", {
    challenge_id: challengeId,
    credential
  });

  return normalizeUser(payload);
}

export async function requestPasskeyLoginOptions({ email }) {
  return apiClient.post("/auth/passkey/login/options", {
    email
  });
}

export async function verifyPasskeyLogin({
  challengeId,
  credential
}) {
  const payload = await apiClient.post("/auth/passkey/login/verify", {
    challenge_id: challengeId,
    credential
  });

  return normalizeUser(payload);
}

export async function requestRecoveryAuth({ email, redirectPath }) {
  return apiClient.post("/auth/recovery/request", {
    email,
    redirect_path: redirectPath
  });
}

export async function verifyRecoveryAuth({ token }) {
  const cacheKey = String(token || "");
  let pendingRequest = pendingVerifyRequestsByToken.get(cacheKey);

  if (!pendingRequest) {
    pendingRequest = apiClient
      .post("/auth/recovery/verify", {
        token
      })
      .finally(() => {
        pendingVerifyRequestsByToken.delete(cacheKey);
      });

    pendingVerifyRequestsByToken.set(cacheKey, pendingRequest);
  }

  const payload = await pendingRequest;
  return normalizeUser(payload);
}

export async function fetchAuthMe() {
  const payload = await apiClient.get("/auth/me", { allowUnauthorized: true });
  return normalizeUser(payload);
}

export async function logoutAuth() {
  await apiClient.post("/auth/logout", {});
}
