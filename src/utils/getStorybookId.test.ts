import { describe, expect, it } from 'vitest';

import { computeStorybookId, normalizeGitUrl } from './getStorybookId';

describe('normalizeGitUrl', () => {
  it('normalizes https and ssh URLs to the same shape', () => {
    expect(normalizeGitUrl('git@github.com:owner/repo.git')).toBe(
      normalizeGitUrl('https://github.com/owner/repo.git')
    );
  });

  it('appends .git when missing', () => {
    expect(normalizeGitUrl('https://github.com/owner/repo')).toMatch(/\.git$/);
  });

  it('strips trailing fragments', () => {
    expect(normalizeGitUrl('https://github.com/owner/repo.git#main')).toBe(
      'github.com/owner/repo.git'
    );
  });
});

describe('computeStorybookId', () => {
  it('returns a stable sha256 hex string for a given remote + path', () => {
    const a = computeStorybookId('git@github.com:owner/repo.git', 'packages/storybook');
    const b = computeStorybookId('git@github.com:owner/repo.git', 'packages/storybook');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces different ids for the same repo at different sub-paths (monorepo)', () => {
    const a = computeStorybookId('git@github.com:owner/repo.git', 'packages/sb-a');
    const b = computeStorybookId('git@github.com:owner/repo.git', 'packages/sb-b');
    expect(a).not.toBe(b);
  });

  it('produces different ids for different remotes at the same path', () => {
    const a = computeStorybookId('git@github.com:owner/one.git', '');
    const b = computeStorybookId('git@github.com:owner/two.git', '');
    expect(a).not.toBe(b);
  });

  it('returns null for null/empty remote', () => {
    expect(computeStorybookId(null, 'x')).toBeNull();
    expect(computeStorybookId(undefined, 'x')).toBeNull();
    expect(computeStorybookId('', 'x')).toBeNull();
  });

  it('treats https and ssh URLs to the same repo as the same id', () => {
    const ssh = computeStorybookId('git@github.com:owner/repo.git', '');
    const https = computeStorybookId('https://github.com/owner/repo.git', '');
    expect(ssh).toBe(https);
  });

  it('normalizes Windows backslashes in project root path', () => {
    const win = computeStorybookId('git@github.com:owner/repo.git', 'packages\\storybook');
    const posix = computeStorybookId('git@github.com:owner/repo.git', 'packages/storybook');
    expect(win).toBe(posix);
  });
});
