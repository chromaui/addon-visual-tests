import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // @see https://github.com/chromaui/chromatic/blob/main/lib/schema/public-schema.graphql
  // We don't automatically update the schema yet, we copy it manually whenever it changes.
  schema: "src/gql/public-schema.graphql",
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
