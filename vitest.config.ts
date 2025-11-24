import path from "path";
import { defineConfig, mergeConfig } from "vitest/config";
import { sharedConfig } from "./vite.config";

export default mergeConfig(
    sharedConfig,
    defineConfig({
        test: {
            globals: true,
            environment: "jsdom",
            setupFiles: "./setupTests.ts",
            pool: "forks",
            poolOptions: {
                forks: {
                    singleFork: true,
                },
            },
        },
        resolve: {
            alias: {
                "@graphql": path.resolve(__dirname, "src/graphql/generated.ts"), // Create alias for the generated file
                "@hooks": path.resolve(__dirname, "./src/hooks/index.tsx"),
                "@context": path.resolve(__dirname, "./src/contexts/index.tsx"),
                "@signals": path.resolve(__dirname, "./src/signals/index.ts"),
                bootstrap: path.resolve(__dirname, "node_modules/bootstrap"),
            },
        },
    })
);
