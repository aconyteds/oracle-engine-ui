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
    })
);
