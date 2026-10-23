import { describe, expect, it } from 'vitest';

import { getViewportGlobal, resolveCaptureModes } from './modes';

describe('resolveCaptureModes', () => {
  it('defaults to a single 1200x900 mode', () => {
    expect(resolveCaptureModes({})).toEqual([
      { name: '1200px', globals: {}, width: 1200, height: 900, isDefault: true },
    ]);
  });

  it('resolves legacy viewports to modes', () => {
    expect(resolveCaptureModes({ chromatic: { viewports: [320, 1024] } })).toEqual([
      { name: '320px', globals: {}, width: 320, height: 900 },
      { name: '1024px', globals: {}, width: 1024, height: 900 },
    ]);
  });

  it('resolves mode viewports by name, object, or plain width', () => {
    const modes = resolveCaptureModes({
      chromatic: {
        modes: {
          small: { viewport: 'mobile1', theme: 'dark' },
          custom: { viewport: { width: 600, height: 400 } },
          wide: { viewport: '1400px' },
        },
      },
    });
    expect(modes).toEqual([
      { name: 'small', globals: { theme: 'dark' }, width: 320, height: 568 },
      { name: 'custom', globals: {}, width: 600, height: 400 },
      { name: 'wide', globals: {}, width: 1400, height: 900 },
    ]);
  });

  it('resolves viewports from the project viewport options, including rotation', () => {
    const modes = resolveCaptureModes({
      chromatic: { modes: { phone: { viewport: { value: 'phone', isRotated: true } } } },
      viewport: { options: { phone: { styles: { width: '375px', height: '667px' } } } },
    });
    expect(modes).toEqual([{ name: 'phone', globals: {}, width: 667, height: 375 }]);
  });

  it('drops disabled and empty modes', () => {
    const modes = resolveCaptureModes({
      chromatic: {
        modes: {
          disabled: { theme: 'dark', disable: true },
          empty: {},
          unresolvable: { viewport: '50%' },
          light: { theme: 'light' },
        },
      },
    });
    expect(modes.map(({ name }) => name)).toEqual(['light']);
  });

  it('falls back to the default mode when all modes are dropped', () => {
    const modes = resolveCaptureModes({ chromatic: { modes: { off: { disable: true } } } });
    expect(modes).toEqual([
      { name: '1200px', globals: {}, width: 1200, height: 900, isDefault: true },
    ]);
  });

  it('clamps viewport sizes', () => {
    const [mode] = resolveCaptureModes({
      chromatic: { modes: { huge: { viewport: { width: 5000, height: 100 } } } },
    });
    expect(mode).toMatchObject({ width: 2560, height: 200 });
  });
});

describe('getViewportGlobal', () => {
  it('uses the width-height format', () => {
    expect(getViewportGlobal({ width: 320, height: 568 })).toEqual({
      value: '320-568',
      isRotated: false,
    });
  });
});
