import { defineConfig } from "tsup";

const { CHROMATIC_BASE_URL = "https://www.chromatic.com" } = process.env;

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/manager.ts"],
  splitting: false,
  minify: !options.watch,
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
  },
  treeshake: true,
  sourcemap: true,
  clean: true,
  platform: "browser",
  esbuildOptions(options) {
    options.conditions = ["module"];
    options.define = {
      "process.env.CHROMATIC_BASE_URL": JSON.stringify(CHROMATIC_BASE_URL),
    };
  },
}));
