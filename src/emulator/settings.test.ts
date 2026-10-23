import { describe, expect, it } from 'vitest';

import { DEFAULT_EMULATOR_SETTINGS, getEmulatorSettings } from './settings';
import { getUnemulatedFeatures } from './unemulated';

describe('getEmulatorSettings', () => {
  it('defaults to disabled with every part on', () => {
    expect(getEmulatorSettings(undefined)).toEqual(DEFAULT_EMULATOR_SETTINGS);
  });

  it('accepts a boolean', () => {
    expect(getEmulatorSettings(true)).toEqual({
      ...DEFAULT_EMULATOR_SETTINGS,
      enabled: true,
    });
  });

  it('merges partial settings and ignores invalid values', () => {
    expect(getEmulatorSettings({ enabled: true, mask: false, carets: 'nope' })).toEqual({
      ...DEFAULT_EMULATOR_SETTINGS,
      enabled: true,
      mask: false,
    });
  });
});

describe('getUnemulatedFeatures', () => {
  it('lists media features and browser settings', () => {
    expect(
      getUnemulatedFeatures(
        { prefersReducedMotion: 'reduce', forcedColors: 'active', media: 'print' },
        { colorScheme: 'dark', locale: 'fr-FR', hasTouch: true }
      )
    ).toEqual([
      'color scheme: dark',
      'prefers-reduced-motion: reduce',
      'forced-colors: active',
      'media: print',
      'browser locale: fr-FR',
      'touch support',
    ]);
  });

  it('is empty by default', () => {
    expect(getUnemulatedFeatures()).toEqual([]);
  });
});
