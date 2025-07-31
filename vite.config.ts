import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_PORT || "3000"),
    host: process.env.VITE_HOST || "localhost",
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
