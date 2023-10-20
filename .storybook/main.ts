import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import turbosnap from "vite-plugin-turbosnap";

import { CHROMATIC_BASE_URL } from "../src/constants";

const useDistVersion = process.env.CHROMATIC_USE_DIST_VERSION === "true";

const configFileMap = {
  "https://www.chromatic.com": "production.config.json",
  "https://www.staging-chromatic.com": "staging.config.json",
  "https://www.dev-chromatic.com": "development.config.json",
};

const config: StorybookConfig = {
  addons: [
    {
      name: "@storybook/addon-essentials",
      options: {
        backgrounds: false,
        viewport: false,
      },
    },
    "@storybook/addon-interactions",
    "@storybook/addon-designs",
    {
      name: useDistVersion ? "../dist/index.js" : "../src/dev.ts",
      options: {
        configFile: configFileMap[CHROMATIC_BASE_URL || '"https://www.chromatic.com"'],
      },
    },
  ],
  docs: {
    autodocs: "tag",
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  logLevel: "debug",
  staticDirs: ["../public"],
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  refs: {
    "@storybook/components": {
      title: "@storybook/components",
      url: "https://next--635781f3500dd2c49e189caf.chromatic.com",
    },
  },
  async viteFinal(config, { configType }) {
    const rootDir = config.root ?? process.cwd();
    return mergeConfig(config, {
      define: { "process.env": { CHROMATIC_API_URL: "/api" } },
      plugins: configType === "PRODUCTION" ? [turbosnap({ rootDir })] : [],
    });
  },
};

export default config;
