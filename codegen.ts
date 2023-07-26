import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.USE_DEV_SCHEMA
    ? "https://www.dev-chromatic.com/api"
    : "https://www.chromatic.com/api",
  documents: ["src/**/*.tsx"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/gql/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: "getFragment" },
      },
    },
  },
};

export default config;
