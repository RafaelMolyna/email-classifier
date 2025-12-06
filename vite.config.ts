import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Crucial for Docker
    strictPort: true,
    port: 5173,
    proxy: {
      "/api": {
        // Use the env var if it exists (Docker), else fallback to localhost (Local)
        target: process.env.VITE_API_URL || "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
