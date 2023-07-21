import type { StorybookConfig } from "@storybook/react-vite";
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
        projectToken: "chpt_5a1a378a1392c49",
        projectId: "6480e1b0042842f149cfd74c",
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
  staticDirs: ["../public"],
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  logLevel: "debug",
};
export default config;
