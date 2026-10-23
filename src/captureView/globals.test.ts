import { describe, expect, it } from 'vitest';

import { getGlobalsUpdate } from './globals';

describe('getGlobalsUpdate', () => {
  it('applies target globals and saves the original values', () => {
    const result = getGlobalsUpdate({
      current: { theme: 'light', locale: 'en' },
      target: { theme: 'dark', viewport: { value: '320-900' } },
      saved: {},
    });
    expect(result.update).toEqual({ theme: 'dark', viewport: { value: '320-900' } });
    expect(result.saved).toEqual({ theme: 'light', viewport: undefined });
  });

  it('keeps the original values when switching between targets', () => {
    const result = getGlobalsUpdate({
      current: { theme: 'dark', viewport: { value: '320-900' }, density: 'compact' },
      target: { viewport: { value: '1200-900' }, density: 'compact' },
      saved: { theme: 'light', viewport: undefined },
    });
    expect(result.update).toEqual({ theme: 'light', viewport: { value: '1200-900' } });
    expect(result.saved).toEqual({ viewport: undefined, density: 'compact' });
  });

  it('restores everything when there is no target', () => {
    const result = getGlobalsUpdate({
      current: { theme: 'dark', viewport: { value: '320-900' } },
      target: {},
      saved: { theme: 'light', viewport: { value: 'mobile1' } },
    });
    expect(result.update).toEqual({ theme: 'light', viewport: { value: 'mobile1' } });
    expect(result.saved).toEqual({});
  });

  it('returns an empty update when nothing changes', () => {
    const result = getGlobalsUpdate({
      current: { theme: 'dark', viewport: { value: '320-900', isRotated: false } },
      target: { theme: 'dark', viewport: { isRotated: false, value: '320-900' } },
      saved: { theme: 'light', viewport: undefined },
    });
    expect(result.update).toEqual({});
  });

  it('skips globals that are locked by the story', () => {
    const result = getGlobalsUpdate({
      current: { theme: 'light' },
      target: { theme: 'dark', locale: 'fr' },
      saved: {},
      locked: { theme: 'light' },
    });
    expect(result.update).toEqual({ locale: 'fr' });
    expect(result.saved).toEqual({ locale: undefined });
  });
});
