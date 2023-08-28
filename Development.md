## Running against development/staging

You can start the addon's Storybook with the `CHROMATIC_BASE_URL` set, as you would with the Chromatic CLI:

```bash
CHROMATIC_BASE_URL=https://www.staging-chromatic.com yarn storybook
```

If running with the index URL set in against the addon's Storybook, we'll also update the configured
project identifier appropriately. If you are running in dev, you can either tweak your database to have
the correct project identifier/token, or you can run with the extra environment variables set:

```bash
CHROMATIC_PROJECT_ID=xyz CHROMATIC_PROJECT_TOKEN=abc CHROMATIC_BASE_URL=https://www.dev-chromatic.com yarn storybook
```

## Running against an outside Storybook

If you want to test the addon with an actual project, you can install it from npm as usual -- we publish canaries for each PR. You can also link the addon in the usual ways.

When running, you can connect the addon to staging/dev similarly, although you'll need to configure the project identifier/token manually.

```bash
CHROMATIC_BASE_URL=https://www.staging-chromatic.com yarn storybook
```
