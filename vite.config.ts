import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export const sharedConfig: UserConfig = {
    plugins: [react(), tsconfigPaths()],
    resolve: {
        alias: {
            "@graphql": path.resolve(__dirname, "src/graphql/generated.ts"), // Create alias for the generated file
            "@hooks": path.resolve(__dirname, "./src/hooks/index.tsx"),
            "@context": path.resolve(__dirname, "./src/contexts/index.tsx"),
            "@signals": path.resolve(__dirname, "./src/signals/index.ts"),
            bootstrap: path.resolve(__dirname, "node_modules/bootstrap"),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
            },
        },
    },
};

export default defineConfig(sharedConfig);
