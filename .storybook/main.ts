import type { StorybookConfig } from "@storybook/react-vite";

const CHROMATIC_BASE_URL = process.env.CHROMATIC_BASE_URL || "https://www.chromatic.com";

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
    "storybook-addon-designs",
    {
      name: "../dist/index.js",
      options: {
        projectToken: "00baf09dbbe8",
      },
    },
  ],
  docs: {
    autodocs: "tag",
  },
  env: (config) => ({
    ...config,
    CHROMATIC_BASE_URL,
  }),
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  logLevel: "debug",
};

export default config;
