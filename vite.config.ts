import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Use jsdom to simulate a browser environment
    setupFiles: "./setupTests.ts", // Optional setup file
    globals: true, // Enable Jest-like global variables (describe, it, expect)
  },
});
