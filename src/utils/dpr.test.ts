import { describe, expect, it } from 'vitest';

import { getDisplayImageSize } from './dpr';

describe('getDisplayImageSize', () => {
  it('returns undefined when no captureImageSize is supplied', () => {
    expect(getDisplayImageSize({ captureImageSize: undefined, deviceScaleFactor: 2 })).toBe(
      undefined
    );
  });

  it('returns captureImageSize unchanged when deviceScaleFactor is 1', () => {
    const captureImageSize = { width: 400, height: 800 };
    expect(getDisplayImageSize({ captureImageSize, deviceScaleFactor: 1 })).toBe(captureImageSize);
  });

  it('returns captureImageSize half of the size when deviceScaleFactor is 2', () => {
    expect(
      getDisplayImageSize({
        captureImageSize: { width: 400, height: 800 },
        deviceScaleFactor: 2,
      })
    ).toStrictEqual({ width: 200, height: 400 });
  });
});
