import { apiClient } from "./client";

const pendingVerifyRequestsByToken = new Map();

function normalizeUser(payload) {
  return payload?.user || null;
}

export async function registerAuth({ email, emailConsent, signupSource = "register_page" }) {
  const payload = await apiClient.post("/auth/register", {
    email,
    email_consent: emailConsent,
    signup_source: signupSource
  });

  return normalizeUser(payload);
}

export async function requestLoginAuth({ email }) {
  return apiClient.post("/auth/login/request", {
    email
  });
}

export async function verifyLoginAuth({ token }) {
  const cacheKey = String(token || "");
  let pendingRequest = pendingVerifyRequestsByToken.get(cacheKey);

  if (!pendingRequest) {
    pendingRequest = apiClient
      .post("/auth/login/verify", {
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
