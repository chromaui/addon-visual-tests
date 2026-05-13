import { describe, expect, it } from 'vitest';

import {
  finalizeSubdomain,
  isValidSubdomain,
  normalizeSubdomain,
  SUBDOMAIN_REGEX,
} from './subdomain';

describe('SUBDOMAIN_REGEX', () => {
  it('accepts simple lowercase alphanumeric labels', () => {
    expect(SUBDOMAIN_REGEX.test('acme')).toBe(true);
    expect(SUBDOMAIN_REGEX.test('a')).toBe(true);
    expect(SUBDOMAIN_REGEX.test('a1b2c3')).toBe(true);
  });

  it('accepts internal hyphens', () => {
    expect(SUBDOMAIN_REGEX.test('acme-co')).toBe(true);
    expect(SUBDOMAIN_REGEX.test('a-b-c')).toBe(true);
  });

  it('rejects leading hyphens', () => {
    expect(SUBDOMAIN_REGEX.test('-acme')).toBe(false);
  });

  it('rejects trailing hyphens', () => {
    expect(SUBDOMAIN_REGEX.test('acme-')).toBe(false);
    expect(SUBDOMAIN_REGEX.test('acme--')).toBe(false);
  });

  it('rejects uppercase characters', () => {
    expect(SUBDOMAIN_REGEX.test('Acme')).toBe(false);
  });

  it('rejects labels longer than 63 characters', () => {
    expect(SUBDOMAIN_REGEX.test('a'.repeat(63))).toBe(true);
    expect(SUBDOMAIN_REGEX.test('a'.repeat(64))).toBe(false);
  });

  it('rejects empty values', () => {
    expect(SUBDOMAIN_REGEX.test('')).toBe(false);
  });
});

describe('isValidSubdomain', () => {
  it('matches the regex contract', () => {
    expect(isValidSubdomain('acme')).toBe(true);
    expect(isValidSubdomain('acme-')).toBe(false);
  });
});

describe('normalizeSubdomain', () => {
  it('lowercases and strips invalid characters', () => {
    expect(normalizeSubdomain('AcMe.Co')).toBe('acmeco');
  });

  it('strips leading hyphens', () => {
    expect(normalizeSubdomain('--acme')).toBe('acme');
  });

  it('collapses repeated hyphens', () => {
    expect(normalizeSubdomain('a--b--c')).toBe('a-b-c');
  });
});

describe('finalizeSubdomain', () => {
  it('strips trailing hyphens after normalization', () => {
    expect(finalizeSubdomain('acme--')).toBe('acme');
  });

  it('produces a value that passes isValidSubdomain', () => {
    expect(isValidSubdomain(finalizeSubdomain('Acme-Co-'))).toBe(true);
  });
});
