import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  define: {
    "process.env": process.env,
  },
  build: {
    target: "esnext", // Ensures modern JavaScript output for faster performance
    minify: "esbuild", // Uses esbuild to minify for faster build times
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // 👇 This line ensures Vite serves index.html for all routes
    historyApiFallback: true,
  },
});
