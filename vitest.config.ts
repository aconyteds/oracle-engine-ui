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
            // This causes test pollution, and fails to isolate tests properly
            // This might need to be enabled for tests to pass during CI.
            // If this needs to be enabled due to memory constraints in CI, we might need an isolated running like on the server
            // poolOptions: {
            //     forks: {
            //         singleFork: true,
            //     },
            // },
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
