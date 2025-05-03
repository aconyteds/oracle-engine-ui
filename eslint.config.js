import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import eslintPrettierConfig from "eslint-config-prettier";

export default tseslint.config(
    { ignores: ["dist", "**/generated.ts", "**/*.generated.ts"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            eslintPrettierConfig, // Integrate Prettier to disable conflicting rules
        ],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2021, // Update to use modern JavaScript features
            globals: globals.browser,
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            prettier, // Add Prettier plugin
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "prettier/prettier": "error", // Ensure Prettier issues are shown as ESLint errors
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_" },
            ], // Ignore unused vars prefixed with _
        },
        settings: {
            react: {
                version: "detect", // Automatically detect React version
            },
        },
    }
);
