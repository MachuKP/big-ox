import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        // changeOrigin: true, // This will modify the origin of the request to the target
        secure: false, // Set to true if your backend uses HTTPS
        rewrite: (path) => path.replace(/^\/api/, ""), // Optional: remove /api prefix
      },
    },
  },
});
