# Agent Instructions for addon-visual-tests

## Release Process

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

```bash
pnpm changeset   # Create a changeset for your changes
pnpm release     # Build and publish (CI handles this automatically)
```

**Before committing, always run the format script to avoid CI failures:**

```bash
pnpm format
```

### Creating Changesets (MANDATORY for user-facing changes)

When making changes that affect users (bug fixes, new features, breaking changes, dependency updates), you **MUST** create a changeset file.

**Steps:**

1. Create a new `.md` file in the `.changeset/` directory
2. Use naming convention: `<random-word>-<random-word>-<random-word>.md` (for example, `swift-trains-smile.md`)
3. Format:

```markdown
---
'@chromatic-com/storybook': patch
---

Short description of what changed.
```

**Version bump types:**

- `patch` — Bug fixes, internal improvements, dependency updates (non-breaking)
- `minor` — New features (backward compatible)
- `major` — Breaking changes

**Writing the description — keep it short:**

- **Default: one sentence.** Most changes need nothing more than a brief statement of what changed.
- Only write more when you are introducing a **breaking change** or a **new public API** that users need to understand or act on — in those cases add migration steps or usage examples.
- Do **not** explain why the change was made, internal implementation details, or repeat what is obvious from the diff.
