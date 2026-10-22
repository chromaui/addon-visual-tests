# Releasing

Releases are managed with [Changesets](https://changesets.dev) and published to npm from GitHub Actions. Nobody publishes from their own machine: the package uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers), which only accepts publishes from the `release.yml` workflow in this repository.

- [Adding a changeset](#adding-a-changeset)
- [Releasing a new version](#releasing-a-new-version)
- [Preview builds](#preview-builds)
- [Backport releases](#backport-releases)
- [Setup](#setup)

## Adding a changeset

A changeset is a small Markdown file in `.changeset/` that says which kind of version bump a change needs and describes it for the changelog. Add one to every PR that changes what users get from the published package:

```sh
pnpm changeset
```

This asks for the bump type and a summary, and writes a file like this, which you commit with your PR:

```markdown
---
'@chromatic-com/storybook': minor
---

Add a button to rerun a single story.
```

Pick the bump type by the effect on users:

| Bump    | Use for                                     |
| ------- | ------------------------------------------- |
| `patch` | Bug fixes and other non-breaking changes    |
| `minor` | New features                                |
| `major` | Breaking changes (add migration notes, too) |

The summary becomes the changelog entry, so write it for users and keep it short. PRs that don't affect the published package (tests, CI, docs, tooling) don't need a changeset.

To change the bump type later, edit or delete the changeset file in a follow-up PR, or in the Version Packages PR before merging it.

## Releasing a new version

1. As PRs with changesets are merged into `main`, the release workflow opens a PR titled **Version Packages** and keeps it up to date. It bumps the version in `package.json`, adds the changesets to `CHANGELOG.md` and deletes the changeset files.
2. The new version uses the highest bump among all pending changesets. For example, one `minor` and three `patch` changesets result in a minor release.
3. When you're ready to release, approve and merge the Version Packages PR. The release workflow then publishes the new version to npm under the `latest` tag, creates a `vX.Y.Z` git tag and GitHub release, and posts to Slack.

Nothing is published until the Version Packages PR is merged. To hold a release (for example because several PRs need to go out together), leave it open: it keeps collecting changesets from PRs merged in the meantime.

## Preview builds

Every commit pushed to a PR and every push to `main` is published as a preview build to [pkg.pr.new](https://pkg.pr.new). This is not the npm registry, so previews never show up as versions or dist-tags of the package on npm.

A bot comments on each PR with install commands. You can install a preview in any project:

```sh
# Latest commit of a PR
npm install https://pkg.pr.new/@chromatic-com/storybook@<pr-number>

# A specific commit (on a PR or on main)
npm install https://pkg.pr.new/@chromatic-com/storybook@<commit-sha>
```

This works with pnpm and Yarn too (`pnpm add <url>`, `yarn add <url>`). The installed package is a full build of the addon. Its `version` field is the version on that branch, not a new version number.

## Backport releases

Fixes for older major versions are released from `release-<major>.x` branches (for example `release-3.x`), using a manual workflow. Backports are published under their own npm dist-tag, so they never become `latest`.

1. If the branch doesn't exist yet, create it from the last release tag of that major version and push it:

   ```sh
   git switch -c release-3.x v3.2.8
   git push -u origin release-3.x
   ```

2. Older branches may still contain a `.github/workflows/release.yml` that publishes on every push (using `auto`). Remove it from the branch before releasing from it, so only the backport workflow publishes.
3. Open a PR against the `release-<major>.x` branch with the fix (for example, by cherry-picking the commit from `main`), and merge it.
4. Go to **Actions → Release → Run workflow**. Keep **Use workflow from** set to `main`, and fill in:
   - **Backport branch**: for example `release-3.x`
   - **Version bump**: `patch` or `minor`
   - **npm dist-tag**: leave empty to use the branch name (`release-3.x`)
5. The workflow installs and builds the branch, bumps the version, publishes to npm, pushes a release commit and `vX.Y.Z` tag to the branch, creates a GitHub release with generated notes, and posts to Slack.

Users can install the latest backport with:

```sh
npm install @chromatic-com/storybook@release-3.x
```

Backport releases don't update `CHANGELOG.md`; their notes are on the GitHub release.

## Setup

The release workflows rely on the following:

- **npm trusted publishing**: the package's trusted publisher on npmjs.com is the `chromaui/addon-visual-tests` repository with the `release.yml` workflow. Don't rename that workflow file. Provenance attestations are generated automatically.
- **`GH_TOKEN` secret**: a personal access token used to open the Version Packages PR, and to push release commits and tags to backport branches. A personal token is needed because PRs opened with the default `GITHUB_TOKEN` don't trigger the required CI checks.
- **`SLACK_WEBHOOK_URL` secret**: an incoming webhook for release notifications.
- **pkg.pr.new GitHub App**: installed on the `chromaui` organization with access to this repository, for preview builds.
