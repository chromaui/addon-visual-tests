import { describe, expect, it } from 'vitest';

import { formatBytesObject } from './formatBytes';

describe('formatBytesObject', () => {
  it('formats SI byte boundaries', () => {
    expect(formatBytesObject(999)).toEqual({ value: 999, symbol: 'B', exponent: 0 });
    expect(formatBytesObject(1000)).toEqual({ value: 1, symbol: 'kB', exponent: 1 });
    expect(formatBytesObject(999949)).toEqual({ value: 999.9, symbol: 'kB', exponent: 1 });
    expect(formatBytesObject(999950)).toEqual({ value: 1, symbol: 'MB', exponent: 2 });
    expect(formatBytesObject(999999)).toEqual({ value: 1, symbol: 'MB', exponent: 2 });
    expect(formatBytesObject(1000000)).toEqual({ value: 1, symbol: 'MB', exponent: 2 });
  });

  it('keeps explicit exponent for aligned-unit formatting', () => {
    expect(formatBytesObject(999999, { exponent: 1, round: 1 })).toEqual({
      value: 1000,
      symbol: 'kB',
      exponent: 1,
    });
  });

  it('returns zero bytes for invalid or non-positive input', () => {
    expect(formatBytesObject(0)).toEqual({ value: 0, symbol: 'B', exponent: 0 });
    expect(formatBytesObject(Number.NaN)).toEqual({ value: 0, symbol: 'B', exponent: 0 });
    expect(formatBytesObject(Number.POSITIVE_INFINITY)).toEqual({
      value: 0,
      symbol: 'B',
      exponent: 0,
    });
  });
});
