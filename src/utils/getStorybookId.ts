import { createHash } from 'node:crypto';
import { relative } from 'node:path';

export const normalizeGitUrl = (rawUrl: string) => {
  const urlWithoutHash = rawUrl.trim().replace(/#.*$/, '');
  const urlWithoutUser = urlWithoutHash.replace(/^.*@/, '');
  const urlWithoutScheme = urlWithoutUser.replace(/^.*\/\//, '');
  const urlWithExtension = urlWithoutScheme.endsWith('.git')
    ? urlWithoutScheme
    : `${urlWithoutScheme}.git`;
  return urlWithExtension.replace(':', '/');
};

const toForwardSlashes = (p: string) => p.replace(/\\/g, '/');

// Stable identifier from a git remote URL + project-root-relative path. Pure
// function so it's trivially testable without mocking Storybook internals.
// Returns null when the remote URL is empty/missing.
export const computeStorybookId = (
  remoteUrl: string | null | undefined,
  projectRootPath: string
): string | null => {
  if (!remoteUrl) return null;
  const payload = `${normalizeGitUrl(remoteUrl)}${toForwardSlashes(projectRootPath)}`;
  return createHash('sha256').update('chromatic-storybook-id-salt').update(payload).digest('hex');
};

// IO wrapper. Pulls the git remote + project root from Storybook's common
// utilities, then delegates to computeStorybookId. Same structural shape as
// Storybook's telemetry anonymousId (git remote + relative project root),
// salted independently so we never accidentally surface the telemetry id.
export const getStorybookId = async (): Promise<string | null> => {
  try {
    const { executeCommandSync, getProjectRoot } = await import('storybook/internal/common');
    const projectRootPath = relative(getProjectRoot(), process.cwd());
    const remoteUrl = executeCommandSync({
      command: 'git',
      args: ['config', '--get', 'remote.origin.url'],
      timeout: 1000,
    });
    return computeStorybookId(remoteUrl, projectRootPath);
  } catch {
    return null;
  }
};
