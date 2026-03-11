import { apiClient } from "./client";

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
  const payload = await apiClient.post("/auth/login/verify", {
    token
  });

  return normalizeUser(payload);
}

export async function fetchAuthMe() {
  const payload = await apiClient.get("/auth/me", { allowUnauthorized: true });
  return normalizeUser(payload);
}

export async function logoutAuth() {
  await apiClient.post("/auth/logout", {});
}
