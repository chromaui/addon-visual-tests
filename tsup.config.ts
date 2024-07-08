import { defineConfig, type Options } from "tsup";
import { readFile } from "fs/promises";
import type { PackageJson } from "type-fest";

type Formats = "esm" | "cjs";
type BundlerConfig = {
  previewEntries: string[];
  managerEntries: string[];
  nodeEntries: string[];
  exportEntries: string[];
  externals: string[];
  pre: string;
  post: string;
  formats: Formats[];
};
type PackageJsonWithBundlerConfig = PackageJson & {
  bundler: BundlerConfig;
};

export default defineConfig(async (options) => {
  // reading the three types of entries from package.json, which has the following structure:
  // {
  //  ...
  //   "bundler": {
  //     "nodeEntries": ["./src/index.ts"],
  //     "managerEntries": ["./src/manager.tsx"],
  //   }
  // }
  const packageJson = (await readFile("./package.json", "utf8").then(
    JSON.parse
  )) as PackageJsonWithBundlerConfig;
  const {
    name,
    dependencies,
    peerDependencies,
    bundler: {
      exportEntries = [],
      nodeEntries = [],
      managerEntries = [],
      externals: extraExternals = [],
    } = {},
  } = packageJson;

  const commonConfig: Options = {
    splitting: false,
    minify: !options.watch,
    treeshake: true,
    clean: true,
  };

  const browserOptions: Options = {
    target: ["chrome100", "safari15", "firefox91"],
    platform: "browser",
    format: ["esm"],
  };

  const commonExternals = [
    name,
    ...extraExternals,
    ...Object.keys(dependencies || {}),
    ...Object.keys(peerDependencies || {}),
  ] as string[];

  const configs: Options[] = [];

  const globalManagerPackagesNoIcons = ["storybook"];

  if (nodeEntries.length) {
    configs.push({
      ...commonConfig,
      entry: nodeEntries,
      format: ["cjs"],
      target: "node18",
      platform: "node",
      external: commonExternals,
    });
  }

  if (managerEntries.length) {
    configs.push({
      ...commonConfig,
      entry: managerEntries,
      format: ["esm"],
      platform: "browser",
      esbuildOptions(options) {
        options.conditions = ["module"];
        options.loader = {
          ...options.loader,
          ".png": "dataurl",
        };
      },
      external: globalManagerPackagesNoIcons,
    });
  }

  if (exportEntries.length > 0) {
    configs.push({
      ...commonConfig,
      ...browserOptions,
      entry: exportEntries,
    });
    configs.push({
      ...commonConfig,
      entry: exportEntries,
      format: ["cjs"],
      target: browserOptions.target,
      platform: "neutral",
    });
  }

  return configs;
});
