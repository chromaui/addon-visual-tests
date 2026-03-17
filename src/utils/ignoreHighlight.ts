import type { HighlightMenuItem, HighlightOptions } from 'storybook/highlight';

import {
  DEFAULT_IGNORE_SELECTORS,
  IGNORE_HIGHLIGHT_ID,
  IGNORE_HIGHLIGHT_SELECT,
} from '../constants';
import type { ChromaticParameters } from '../types';

type ChromaticConfig = ChromaticParameters['chromatic'];

const defaultHighlightStyles = {
  backgroundColor: 'rgba(255, 173, 51, 0.2)',
  outline: '1px solid rgba(255, 173, 51, 0.7)',
  outlineOffset: '-1px',
};

const defaultHoverStyles = {
  backgroundColor: 'rgba(255, 173, 51, 0.1)',
  outlineWidth: '2px',
};

const defaultFocusStyles = {
  backgroundColor: 'transparent',
  outlineWidth: '2px',
};

const isSupportedSelector = (selector: string) => {
  if (!selector) return false;
  if (typeof document === 'undefined') return true;

  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    console.warn(`Invalid ignoreSelector: ${selector}`);
    return false;
  }
};

export const getIgnoreHighlightOptions = (config: ChromaticConfig): HighlightOptions => {
  const ignoreSelectors = config?.ignoreSelectors ?? [];
  const selectors = Array.from(
    new Set(DEFAULT_IGNORE_SELECTORS.concat(ignoreSelectors.filter(isSupportedSelector)))
  );

  return {
    id: IGNORE_HIGHLIGHT_ID,
    selectors,
    styles: defaultHighlightStyles,
    hoverStyles: defaultHoverStyles,
    focusStyles: defaultFocusStyles,
    menu: selectors.map<HighlightMenuItem[]>((selector) => {
      const isDefaultSelector = DEFAULT_IGNORE_SELECTORS.includes(selector);
      return [
        {
          id: `${selector}-info`,
          title: 'Element ignored in visual tests',
          description: isDefaultSelector
            ? `${selector} will be ignored by Chromatic`
            : `${selector} matches an ignored selector`,
          selectors: [selector],
        },
        {
          id: `${selector}-link`,
          iconLeft: 'info',
          iconRight: 'shareAlt',
          title: 'Learn how to configure ignored elements',
          clickEvent: IGNORE_HIGHLIGHT_SELECT,
          selectors: [selector],
        },
      ];
    }),
  };
};
