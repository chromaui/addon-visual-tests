# Storybook Addon Visual Tests

Visual Testing addon with Chromatic

## Installation

Add the `@chromaui/visual-tests` addon, and add it to `main.js`:

```
yarn add --dev @chromaui/visual-tests
```

```
// main.js:
"addons": ["@chromaui/visual-tests"]
```

### Troubleshooting

If you see:

```
var stringWidth = require('string-width')
                  ^

Error [ERR_REQUIRE_ESM]: require() of ES Module /Users
```

In Yarn 1 starting up your Storybook after installation, you can [workaround with](https://github.com/storybookjs/storybook/issues/22431#issuecomment-1630086092):

```
 "resolutions": {
    "jackspeak": "2.1.1"
  }
```

Alternatively, you could use a different package manager (yarn 3, npm, pnpm).