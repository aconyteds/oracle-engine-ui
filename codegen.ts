import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    // ...
    generates: {
        "./src/graphql/generated.ts": {
            schema: "http://localhost:4000/graphql",
            documents: "./src/graphql/*.graphql",
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-react-apollo",
            ],
            config: {},
        },
    },
};
export default config;
