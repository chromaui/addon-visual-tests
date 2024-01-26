import { defineConfig } from "tsup";

// We're not building an API for consumption by other projects. Instead, Storybook will bundle
// everything in the end, which is why we don't compile dts or sourcemaps.
export default defineConfig((options) => [
  {
    clean: !options.watch,
    entry: ["src/index.ts"],
    format: ["cjs"],
    platform: "node",
    splitting: false,
    treeshake: true,
    esbuildOptions(options) {
      options.conditions = ["module"];
      options.loader = {
        ...options.loader,
        ".png": "dataurl",
      }
    },
  },
  {
    clean: !options.watch,
    entry: ["src/manager.tsx"],
    format: ["esm"],
    platform: "browser",
    splitting: false,
    treeshake: true,
    esbuildOptions(options) {
      options.conditions = ["module"];
      options.loader = {
        ...options.loader,
        ".png": "dataurl",
      }
    },
  },
]);
