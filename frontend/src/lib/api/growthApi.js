import { apiClient } from "./client";

export async function captureFollowBuildEmail({ email }) {
  return apiClient.post("/follow-the-build/capture", {
    email,
    email_consent: true
  });
}
