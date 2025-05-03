/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: "jsdom", // Use jsdom to simulate a browser environment
        setupFiles: "setupTests.ts", // Optional setup file
        globals: true, // Enable Jest-like global variables (describe, it, expect)
    },
    resolve: {
        alias: {
            "@graphql": path.resolve(__dirname, "src/graphql/generated.ts"), // Create alias for the generated file
            "@hooks": path.resolve(__dirname, "./src/hooks/index.tsx"),
            "@context": path.resolve(__dirname, "./src/contexts/index.tsx"),
            bootstrap: path.resolve(__dirname, "node_modules/bootstrap"),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                sassOptions: {
                    quietDeps: true,
                },
            },
        },
    },
});
