import { apiClient } from "./client";

export async function fetchCatalogData() {
  const [profiles, tasks, priorities] = await Promise.all([
    apiClient.get("/profiles"),
    apiClient.get("/tasks"),
    apiClient.get("/priorities")
  ]);

  return {
    profiles: Array.isArray(profiles) ? profiles : [],
    tasks: Array.isArray(tasks) ? tasks : [],
    priorities: Array.isArray(priorities) ? priorities : []
  };
}
