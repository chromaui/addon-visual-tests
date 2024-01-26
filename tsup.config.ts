import { defineConfig, type Options } from "tsup";
import { readFile } from "fs/promises";
import { globalPackages as globalManagerPackages } from "@storybook/manager/globals";
import { globalPackages as globalPreviewPackages } from "@storybook/preview/globals";

type BundlerConfig = {
  bundler?: {
    exportEntries?: string[];
    nodeEntries?: string[];
    managerEntries?: string[];
    previewEntries?: string[];
  };
};

// We're not building an API for consumption by other projects. Instead, Storybook will bundle
// everything in the end, which is why we don't compile dts or sourcemaps.
// export default defineConfig((options) => [
//   {
//     clean: !options.watch,
//     entry: ["src/index.ts"],
//     format: ["cjs"],
//     platform: "node",
//     splitting: false,
//     treeshake: true,
//     esbuildOptions(options) {
//       options.conditions = ["module"];
//     },
//   },
//   {
//     clean: !options.watch,
//     entry: ["src/manager.tsx"],
//     format: ["esm"],
//     platform: "browser",
//     splitting: false,
//     treeshake: true,
//     esbuildOptions(options) {
//       options.conditions = ["module"];
//     },
//   },
// ]);

export default defineConfig(async (options) => {
  // reading the three types of entries from package.json, which has the following structure:
  // {
  //  ...
  //   "bundler": {
  //     "exportEntries": ["./src/index.ts"],
  //     "managerEntries": ["./src/manager.ts"],
  //     "previewEntries": ["./src/preview.ts"]
  //   }
  // }
  const packageJson = await readFile('./package.json', 'utf8').then(JSON.parse) as BundlerConfig;
  const {
    bundler: {
      exportEntries = [],
      managerEntries = [],
      previewEntries = [],
    } = {},
  } = packageJson;

  const commonConfig: Options = {
    splitting: false,
    minify: !options.watch,
    treeshake: true,
    sourcemap: true,
    clean: true,
  };

  const configs: Options[] = [];

  // export entries are entries meant to be manually imported by the user
  // they are not meant to be loaded by the manager or preview
  // they'll be usable in both node and browser environments, depending on which features and modules they depend on
  if (exportEntries.length) {
    configs.push({
      ...commonConfig,
      entry: exportEntries,
      dts: {
        resolve: true,
      },
      format: ["esm", 'cjs'],
      platform: "neutral",
      external: [...globalManagerPackages, ...globalPreviewPackages],
    });
  }

  // export entries are entries meant to be manually imported by the user
  // they are not meant to be loaded by the manager or preview
  // they'll be usable in both node and browser environments, depending on which features and modules they depend on
  if (exportEntries.length) {
    configs.push({
      ...commonConfig,
      entry: exportEntries,
      dts: {
        resolve: true,
      },
      format: ["esm", 'cjs'],
      platform: "neutral",
      external: [...globalManagerPackages, ...globalPreviewPackages],
    });
  }
  // manager entries are entries meant to be loaded into the manager UI
  // they'll have manager-specific packages externalized and they won't be usable in node
  // they won't have types generated for them as they're usually loaded automatically by Storybook
  if (managerEntries.length) {
    configs.push({
      ...commonConfig,
      entry: managerEntries,
      format: ["esm"],
      platform: "browser",
      external: globalManagerPackages,
    });
  }

  return configs;
})