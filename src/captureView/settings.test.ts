import { describe, expect, it } from 'vitest';

import { DEFAULT_CAPTURE_VIEW_SETTINGS, getCaptureViewSettings } from './settings';
import { getUnemulatedFeatures } from './unemulated';

describe('getCaptureViewSettings', () => {
  it('defaults to disabled with every part on', () => {
    expect(getCaptureViewSettings(undefined)).toEqual(DEFAULT_CAPTURE_VIEW_SETTINGS);
  });

  it('accepts a boolean', () => {
    expect(getCaptureViewSettings(true)).toEqual({
      ...DEFAULT_CAPTURE_VIEW_SETTINGS,
      enabled: true,
    });
  });

  it('merges partial settings and ignores invalid values', () => {
    expect(getCaptureViewSettings({ enabled: true, mask: false, carets: 'nope' })).toEqual({
      ...DEFAULT_CAPTURE_VIEW_SETTINGS,
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
