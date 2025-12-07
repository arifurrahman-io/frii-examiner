import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Load environment variables from .env files
const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:5000"; // fallback to localhost

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
