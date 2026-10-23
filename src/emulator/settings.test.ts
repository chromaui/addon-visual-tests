import { describe, expect, it } from 'vitest';

import { DEFAULT_EMULATOR_SETTINGS, getEmulatorSettings, isEmulatorActive } from './settings';

describe('getEmulatorSettings', () => {
  it('defaults to every part off', () => {
    expect(getEmulatorSettings(undefined)).toEqual({
      viewport: false,
      rendering: false,
      identity: false,
    });
  });

  it('accepts a boolean to turn every part on or off', () => {
    expect(getEmulatorSettings(true)).toEqual({ viewport: true, rendering: true, identity: true });
    expect(getEmulatorSettings(false)).toEqual(DEFAULT_EMULATOR_SETTINGS);
  });

  it('merges partial settings and ignores invalid values', () => {
    expect(getEmulatorSettings({ viewport: true, identity: 'nope', unknown: true })).toEqual({
      ...DEFAULT_EMULATOR_SETTINGS,
      viewport: true,
    });
  });
});

describe('isEmulatorActive', () => {
  it('is active when any part is on', () => {
    expect(isEmulatorActive(DEFAULT_EMULATOR_SETTINGS)).toBe(false);
    expect(isEmulatorActive({ ...DEFAULT_EMULATOR_SETTINGS, identity: true })).toBe(true);
  });
});
