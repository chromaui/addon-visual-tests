import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  HIGHLIGHT_IGNORED_DEFAULT_SELECTORS,
  HIGHLIGHT_IGNORED_ID,
  HIGHLIGHT_IGNORED_SELECT,
} from '../constants';
import { getIgnoreHighlightOptions } from './ignoreHighlight';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('getIgnoreHighlightOptions', () => {
  it('returns the default ignored selectors when no config is provided', () => {
    const options = getIgnoreHighlightOptions(undefined);

    expect(options).toMatchObject({
      id: HIGHLIGHT_IGNORED_ID,
      selectors: HIGHLIGHT_IGNORED_DEFAULT_SELECTORS,
      styles: {
        backgroundColor: 'rgba(255, 173, 51, 0.2)',
        outline: '1px solid rgba(255, 173, 51, 0.7)',
        outlineOffset: '-1px',
      },
      hoverStyles: {
        backgroundColor: 'rgba(255, 173, 51, 0.1)',
        outlineWidth: '2px',
      },
      focusStyles: {
        backgroundColor: 'transparent',
        outlineWidth: '2px',
      },
    });
  });

  it('deduplicates selectors and builds menu items for default and custom selectors', () => {
    vi.stubGlobal('document', {
      createDocumentFragment: () => ({
        querySelector: vi.fn(),
      }),
    });

    const customSelector = '[data-testid="custom-ignore"]';
    const options = getIgnoreHighlightOptions({
      ignoreSelectors: [HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[0], customSelector, '', customSelector],
    });

    expect(options.selectors).toEqual([...HIGHLIGHT_IGNORED_DEFAULT_SELECTORS, customSelector]);
    expect(options.menu).toEqual([
      [
        {
          id: `${HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[0]}-info`,
          title: 'Element ignored in visual tests',
          description: `${HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[0]} will be ignored by Chromatic`,
          selectors: [HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[0]],
        },
        {
          id: `${HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[0]}-link`,
          iconLeft: 'info',
          iconRight: 'shareAlt',
          title: 'Learn how to configure ignored elements',
          clickEvent: HIGHLIGHT_IGNORED_SELECT,
          selectors: [HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[0]],
        },
      ],
      [
        {
          id: `${HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[1]}-info`,
          title: 'Element ignored in visual tests',
          description: `${HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[1]} will be ignored by Chromatic`,
          selectors: [HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[1]],
        },
        {
          id: `${HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[1]}-link`,
          iconLeft: 'info',
          iconRight: 'shareAlt',
          title: 'Learn how to configure ignored elements',
          clickEvent: HIGHLIGHT_IGNORED_SELECT,
          selectors: [HIGHLIGHT_IGNORED_DEFAULT_SELECTORS[1]],
        },
      ],
      [
        {
          id: `${customSelector}-info`,
          title: 'Element ignored in visual tests',
          description: `${customSelector} matches an ignored selector`,
          selectors: [customSelector],
        },
        {
          id: `${customSelector}-link`,
          iconLeft: 'info',
          iconRight: 'shareAlt',
          title: 'Learn how to configure ignored elements',
          clickEvent: HIGHLIGHT_IGNORED_SELECT,
          selectors: [customSelector],
        },
      ],
    ]);
  });

  it('warns and excludes invalid selectors', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.stubGlobal('document', {
      createDocumentFragment: () => ({
        querySelector: (selector: string) => {
          if (selector === '[') throw new Error('Invalid selector');
          return null;
        },
      }),
    });

    const options = getIgnoreHighlightOptions({
      ignoreSelectors: ['[', '.valid-ignore'],
    });

    expect(options.selectors).toEqual([...HIGHLIGHT_IGNORED_DEFAULT_SELECTORS, '.valid-ignore']);
    expect(warn).toHaveBeenCalledWith('Invalid ignoreSelector: [');
  });
});
