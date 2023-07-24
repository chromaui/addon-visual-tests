import { defineConfig } from "tsup";

const CHROMATIC_BASE_URL = process.env.CHROMATIC_BASE_URL || "https://www.chromatic.com";

export default defineConfig((options) => [
  {
    entry: ["src/index.ts"],
    splitting: false,
    minify: !options.watch,
    format: ["cjs"],
    dts: {
      resolve: true,
    },
    treeshake: true,
    sourcemap: true,
    clean: !options.watch,
    platform: "node",
    esbuildOptions(options) {
      options.conditions = ["module"];
      options.define = {
        "process.env.CHROMATIC_BASE_URL": JSON.stringify(CHROMATIC_BASE_URL),
      };
    },
  },
  {
    entry: ["src/manager.ts"],
    splitting: false,
    minify: !options.watch,
    format: ["esm"],
    dts: {
      resolve: true,
    },
    treeshake: true,
    sourcemap: true,
    clean: !options.watch,
    platform: "browser",
    esbuildOptions(options) {
      options.conditions = ["module"];
      options.define = {
        "process.env.CHROMATIC_BASE_URL": JSON.stringify(CHROMATIC_BASE_URL),
      };
    },
  },
]);
