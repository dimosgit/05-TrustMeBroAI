/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 40px -20px rgba(2, 6, 23, 0.35)",
        premium: "0 20px 50px -12px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px -5px rgba(99, 102, 241, 0.3)"
      },
      colors: {
        background: "#0f172a",
        card: "#1e293b",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1", // Indigo accent
          600: "#4f46e5",
          700: "#4338ca"
        },
        secondary: {
          500: "#7c3aed", // Purple accent
          600: "#6d28d9"
        },
        primaryText: "#f8fafc",
        secondaryText: "#94a3b8"
      }
    }
  },
  plugins: []
};
