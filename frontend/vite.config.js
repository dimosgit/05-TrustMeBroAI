import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function extractHostnames(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      try {
        return new URL(entry).hostname;
      } catch {
        return entry.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
      }
    })
    .filter(Boolean);
}

const allowedHosts = Array.from(
  new Set([
    ...extractHostnames(process.env.FRONTEND_ORIGIN),
    ...extractHostnames(process.env.VITE_ALLOWED_HOSTS)
  ])
);

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    allowedHosts: allowedHosts.length > 0 ? allowedHosts : undefined,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
});
