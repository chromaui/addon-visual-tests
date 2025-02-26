import { describe, expect, it } from 'vitest';

import { ComparisonResult, StoryTestFieldsFragment } from '../gql/graphql';
import { getMostUsefulComparison, getMostUsefulTest } from './useTests';

describe('getMostUsefulTest', () => {
  const chrome = { browser: { id: 'chrome' }, result: ComparisonResult.Equal };
  const safari = { browser: { id: 'safari' }, result: ComparisonResult.Equal };
  const chromeChanged = { browser: { id: 'chrome' }, result: ComparisonResult.Changed };
  const safariChanged = { browser: { id: 'safari' }, result: ComparisonResult.Changed };

  const alpha = { mode: { name: 'A' }, comparisons: [chrome] };
  const bravo = { mode: { name: 'B' }, comparisons: [chrome, safari] };
  const charlie = { mode: { name: 'C' }, comparisons: [chromeChanged] };
  const delta = { mode: { name: 'D' }, comparisons: [chrome, safariChanged] };

  describe('when some tests have changes', () => {
    const tests = [alpha, bravo, charlie, delta] as StoryTestFieldsFragment[];

    it('returns the test with changes that matches the given mode name', () => {
      const modeName = 'D';
      const test = getMostUsefulTest(tests, modeName);
      expect(test).toEqual(delta);
    });

    it('returns the first test with changes when none of them match the given mode name', () => {
      const modeName = 'Z';
      const test = getMostUsefulTest(tests, modeName);
      expect(test).toEqual(charlie);
    });

    it('returns the first test with changes when no mode name is given', () => {
      const test = getMostUsefulTest(tests);
      expect(test).toEqual(charlie);
    });
  });

  describe('when no tests have changes', () => {
    const tests = [alpha, bravo] as StoryTestFieldsFragment[];

    it('returns the first test that matches the given mode name', () => {
      const modeName = 'B';
      const test = getMostUsefulTest(tests, modeName);
      expect(test).toEqual(bravo);
    });

    it('returns the first test when none match the given mode name', () => {
      const modeName = 'Z';
      const test = getMostUsefulTest(tests, modeName);
      expect(test).toEqual(alpha);
    });

    it('returns the first test when no mode name is given', () => {
      const test = getMostUsefulTest(tests);
      expect(test).toEqual(alpha);
    });
  });

  // no tests
});

describe('getMostUsefulComparison', () => {
  const chrome = { browser: { id: 'chrome' }, result: ComparisonResult.Equal };
  const safari = { browser: { id: 'safari' }, result: ComparisonResult.Equal };
  const chromeChanged = { browser: { id: 'chrome' }, result: ComparisonResult.Changed };
  const safariChanged = { browser: { id: 'safari' }, result: ComparisonResult.Changed };

  describe('when some comparisons have changes', () => {
    const comparisons = [
      chrome,
      safari,
      chromeChanged,
      safariChanged,
    ] as StoryTestFieldsFragment['comparisons'];

    it('returns the comparison with changes that matches the given browser id', () => {
      const browserId = 'safari';
      const comparison = getMostUsefulComparison(comparisons, browserId);
      expect(comparison).toEqual(safariChanged);
    });

    it('returns the first comparison with changes when none of them match the given browser id', () => {
      const browserId = 'firefox';
      const comparison = getMostUsefulComparison(comparisons, browserId);
      expect(comparison).toEqual(chromeChanged);
    });

    it('returns the first comparison with changes when no browser id is given', () => {
      const comparison = getMostUsefulComparison(comparisons);
      expect(comparison).toEqual(chromeChanged);
    });
  });

  describe('when no comparisons have changes', () => {
    const comparisons = [chrome, safari] as StoryTestFieldsFragment['comparisons'];

    it('returns the first comparison that matches the given browser id', () => {
      const browserId = 'safari';
      const comparison = getMostUsefulComparison(comparisons, browserId);
      expect(comparison).toEqual(safari);
    });

    it('returns the first comparison when none match the given browser id', () => {
      const browserId = 'firefox';
      const comparison = getMostUsefulComparison(comparisons, browserId);
      expect(comparison).toEqual(chrome);
    });

    it('returns the first comparison when no browser id is given', () => {
      const comparison = getMostUsefulComparison(comparisons);
      expect(comparison).toEqual(chrome);
    });
  });
});
