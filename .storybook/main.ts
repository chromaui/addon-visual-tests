import type { StorybookConfig } from "@storybook/react-vite";
import { CHROMATIC_BASE_URL } from "../src/constants";

const prodConfig = {
  projectToken: "chpt_5a1a378a1392c49",
  projectId: "Project:6480e1b0042842f149cfd74c",
};

const stagingConfig = {
  projectToken: "chpt_fdc053b44dc78f3",
  projectId: "Project:64936c844fd570be8b75bdac",
};

// You probably want to tweak your dev database to have these values.
// Otherwise run with env vars set
const devConfig = {
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN || "chpt_a898d6d22bcc592",
  projectId: process.env.CHROMATIC_PROJECT_ID || "Project:64c0b64ef4c47fe31e1262f5",
};

const addonOptionsMap = {
  "https://www.chromatic.com": prodConfig,
  "https://www.staging-chromatic.com": stagingConfig,
  "https://www.dev-chromatic.com": devConfig,
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
      name: "../dist/index.js",
      options: addonOptionsMap[CHROMATIC_BASE_URL],
    },
  ],
  docs: {
    autodocs: "tag",
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  logLevel: "debug",
};
export default config;
