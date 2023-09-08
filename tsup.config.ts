import { defineConfig } from "tsup";

export default defineConfig((options) => [
  {
    entry: ["src/index.ts"],
    splitting: false,
    minify: !options.watch,
    format: ["cjs"],
    dts: false,
    treeshake: true,
    sourcemap: true,
    clean: !options.watch,
    platform: "node",
    esbuildOptions(options) {
      options.conditions = ["module"];
    },
  },
  {
    entry: ["src/manager.tsx"],
    splitting: false,
    minify: !options.watch,
    format: ["esm"],
    dts: false,
    treeshake: true,
    sourcemap: true,
    clean: !options.watch,
    platform: "browser",
    esbuildOptions(options) {
      options.conditions = ["module"];
    },
  },
]);
