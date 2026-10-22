# Agent instructions

Before creating, updating, or pushing a pull request, run:

```sh
pnpm gate
```

The command must complete successfully. Fix any failures and rerun the full gate before pushing.

## Changesets

Every PR that changes what users get from the published package (bug fixes, features, breaking changes, dependency updates that affect users) must include a changeset. Create one with `pnpm changeset`, or add a file to `.changeset/` by hand:

```markdown
---
'@chromatic-com/storybook': patch
---

Short description of what changed.
```

- `patch`: bug fixes and other non-breaking changes
- `minor`: new features
- `major`: breaking changes

Keep the description to one sentence, written for users. Only add more (migration steps, usage examples) for breaking changes or new public APIs. PRs that don't affect the published package (tests, CI, docs, tooling) don't need a changeset.

See [RELEASING.md](./RELEASING.md) for the full release process.
