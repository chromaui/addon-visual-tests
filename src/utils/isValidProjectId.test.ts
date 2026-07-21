import { describe, expect, it } from 'vitest';

import {
  isProjectTokenAsProjectId,
  isValidProjectId,
  stripProjectIdPrefix,
} from './isValidProjectId';

describe('isValidProjectId', () => {
  it('accepts Project: + 24-hex ObjectId', () => {
    expect(isValidProjectId('Project:6480e1b0042842f149cfd74c')).toBe(true);
  });

  it('accepts bare 24-hex ObjectId', () => {
    expect(isValidProjectId('6480e1b0042842f149cfd74c')).toBe(true);
  });

  it('rejects empty and short values', () => {
    expect(isValidProjectId('')).toBe(false);
    expect(isValidProjectId('Project:')).toBe(false);
    expect(isValidProjectId('abc123')).toBe(false);
  });

  it('rejects non-hex 24-char strings', () => {
    expect(isValidProjectId('Project:zzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false);
  });

  it('rejects project tokens pasted as projectId', () => {
    expect(isValidProjectId('chpt_abc123def4567')).toBe(false);
    expect(isValidProjectId('Project:chpt_abc123def4567')).toBe(false);
  });
});

describe('isProjectTokenAsProjectId', () => {
  it('detects chpt_ tokens with or without Project: prefix', () => {
    expect(isProjectTokenAsProjectId('chpt_abc123def4567')).toBe(true);
    expect(isProjectTokenAsProjectId('Project:chpt_abc123def4567')).toBe(true);
  });

  it('is false for valid project ids', () => {
    expect(isProjectTokenAsProjectId('Project:6480e1b0042842f149cfd74c')).toBe(false);
  });
});

describe('stripProjectIdPrefix', () => {
  it('strips only a leading Project: prefix', () => {
    expect(stripProjectIdPrefix('Project:abc')).toBe('abc');
    expect(stripProjectIdPrefix('abc')).toBe('abc');
  });
});
