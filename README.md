# Storybook Visual Testing addon

The Visual testing addon enables you to run visual tests on your stories and compare changes with the latest baselines across multiple viewports and browsers to catch UI regressions early in development without leaving Storybook.


## Prerequisites

- Chromatic [account configured](https://www.chromatic.com/docs/setup#sign-up) with access to a project
- Storybook 7.2 or later

## Getting Started

1. Install this addon by adding the `@chromaui/addon-visual-tests` dependency:

```shell
yarn add --dev @chromaui/addon-visual-tests
```

2. Update your Storybook configuration file (e.g., `.storybook/main.js|ts`) to include the addon:

```ts
// .storybook/main.ts

// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-vite)
import type { StorybookConfig } from '@storybook/your-framework';

const config: StorybookConfig = {
  framework: '@storybook/your-framework',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // Other Storybook addons
    '@chromaui/addon-visual-tests',
  ],
};

export default config;
```

3. Start Storybook and navigate to the Visual Tests panel to run your first visual test with Chromatic!

### Configuration

By default, the addon offers zero-config support to run visual tests with Storybook and Chromatic. However, you can extend your Storybook configuration file (i.e., `.storybook/main.js|ts`) and provide additional options to control how tests are run. Listed below are the available options and examples of how to use them.


| Option            | Description                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `buildScriptName` | Optional. Defines the custom Storybook build script <br/> `options: { buildScriptName: 'deploy-storybook' }`                     |

```ts
// .storybook/main.ts

// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-vite)
import type { StorybookConfig } from '@storybook/your-framework';

const config: StorybookConfig = {
  framework: '@storybook/your-framework',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // Other Storybook addons
    '@chromaui/addon-visual-tests',
     {
      name: '@chromaui/addon-visual-tests',
      options: {
        buildScriptName: 'deploy-storybook',
      },
  ],
};

export default config;
```

## Troubleshooting

### Running Storybook with the addon enabled throws an error

When installed, running Storybook may lead to the following error:

```shell
const stringWidth = require('string-width');

Error [ERR_REQUIRE_ESM]: require() of ES Module /my-project/node_modules/string-width/index.js is not supported.
```

This is a [known issue](https://github.com/storybookjs/storybook/issues/22431#issuecomment-1630086092) when using an older version of the Yarn package manager (e.g., version 1.x). To solve this issue, you can [upgrade](https://yarnpkg.com/migration/guide) to the latest stable version. However, if you cannot upgrade, adjust your `package.json` file and provide a resolution field to enable the Yarn package manager to install the correct dependencies. In doing so, you may be required to delete your `node_modules` directory and `yarn.lock` file before installing the dependencies again.

```json
 "resolutions": {
    "jackspeak": "2.1.1"
  }
```

Alternatively, you could use a different package manager ([npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/installation)).


## Contributing

We welcome contributions to the Storybook Addon Visual Tests! If you're a maintainer, refer to the following [instructions](./Development.md) to set up your development environment with Chromatic.

### License

[MIT](https://github.com/storybookjs/addon-coverage/blob/main/LICENSE)
