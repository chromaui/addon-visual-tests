import type { HighlightMenuItem, HighlightOptions } from 'storybook/highlight';

import {
  HIGHLIGHT_IGNORED_DEFAULT_SELECTORS,
  HIGHLIGHT_IGNORED_ID,
  HIGHLIGHT_IGNORED_SELECT,
} from '../constants';
import type { ChromaticParameters } from '../types';

type ChromaticConfig = ChromaticParameters['chromatic'];

// Storybook versions differ in how a menu item opts into click handling: older versions emit the
// event named by `clickEvent`, newer versions emit HIGHLIGHT_MENU_CLICK for `clickable` items.
// Setting both keeps the item clickable on every supported version.
type IgnoreHighlightMenuItem = HighlightMenuItem & {
  clickEvent?: string;
  clickable?: boolean;
};

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
    new Set(HIGHLIGHT_IGNORED_DEFAULT_SELECTORS.concat(ignoreSelectors.filter(isSupportedSelector)))
  );

  return {
    id: HIGHLIGHT_IGNORED_ID,
    selectors,
    styles: defaultHighlightStyles,
    hoverStyles: defaultHoverStyles,
    focusStyles: defaultFocusStyles,
    menu: selectors.map<IgnoreHighlightMenuItem[]>((selector) => {
      const isDefaultSelector = HIGHLIGHT_IGNORED_DEFAULT_SELECTORS.includes(selector);
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
          clickEvent: HIGHLIGHT_IGNORED_SELECT,
          clickable: true,
          selectors: [selector],
        },
      ];
    }),
  };
};
