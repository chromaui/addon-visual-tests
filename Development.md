## Running against development/staging

You can simply start the storybook with the `CHROMATIC_INDEX_URL` set, as you would with the chromatic CLI:

```bash
CHROMATIC_INDEX_URL=https://www.staging-chromatic.com yarn storybook
```

If running with the index URL set in against the addon's storybook, we'll also update the configured
project id appropriately. If you are running in dev, you can either tweak your database to have
the correct project id/token, or you can run with the extra env vars set:

```bash
CHROMATIC_PROJECT_ID=xyz CHROMATIC_PROJECT_TOKEN=abc CHROMATIC_INDEX_URL=https://www.dev-chromatic.com yarn storybook
```

## Running against an outside storybook

If you want to test the addon with a real project, you can install from npm as usual -- we publish canaries for each PR. You can also link the addon in the usual ways.

When running you can also connect the adon to staging/dev in the same way, although you'll need to manually configure the project id/token.

```bash
CHROMATIC_INDEX_URL=https://www.staging-chromatic.com yarn storybook
```
