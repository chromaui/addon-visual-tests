import { describe, expect, it } from 'vitest';

import { Browser } from '../gql/graphql';
import { getCapturedPixelRatio, getDisplayImageSize } from './dpr';

describe('dpr', () => {
  describe('getCapturedPixelRatio', () => {
    it('returns 1 for non-React Native when no deviceScaleFactor is provided', () => {
      expect(
        getCapturedPixelRatio({
          isReactNative: false,
          browser: Browser.Chrome,
          browsers: [Browser.Chrome],
        })
      ).toBe(1);
    });

    it('returns pixel ratio as 2 when deviceScaleFactor is 2', () => {
      expect(
        getCapturedPixelRatio({
          isReactNative: false,
          browser: Browser.Chrome,
          browsers: [Browser.Chrome],
          deviceScaleFactor: 2,
        })
      ).toBe(2);
    });
  });

  describe('getDisplayImageSize', () => {
    it('returns captureImageSize unchanged when capturedPixelRatio is 1', () => {
      const captureImageSize = { width: 400, height: 800 };
      expect(getDisplayImageSize({ captureImageSize, capturedPixelRatio: 1 })).toBe(captureImageSize);
    });

    it('returns captureImageSize half of the size when capturedPixelRatio is 2', () => {
      expect(
        getDisplayImageSize({
          captureImageSize: { width: 400, height: 800 },
          capturedPixelRatio: 2,
        })
      ).toStrictEqual({ width: 200, height: 400 });
    });
  });
});
