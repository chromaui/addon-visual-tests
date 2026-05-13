import { HIGHLIGHT, REMOVE_HIGHLIGHT } from 'storybook/highlight';
import { useChannel, useEffect } from 'storybook/preview-api';

import {
  HIGHLIGHT_IGNORED_COUNT,
  HIGHLIGHT_IGNORED_ID,
  HIGHLIGHT_IGNORED_PARAM,
} from './constants';
import { getIgnoreHighlightOptions } from './utils/ignoreHighlight';

const WithIgnoreHighlight = (Story: any, { globals, parameters, id }: any) => {
  const enabled = !!globals[HIGHLIGHT_IGNORED_PARAM];
  const emit = useChannel({});
  const highlightOptions = getIgnoreHighlightOptions(parameters.chromatic);
  const selectorKey = highlightOptions?.selectors.join('\n') ?? '';

  useEffect(() => {
    emit(REMOVE_HIGHLIGHT, HIGHLIGHT_IGNORED_ID);
    if (!highlightOptions?.selectors.length) {
      emit(HIGHLIGHT_IGNORED_COUNT, 0);
      return;
    }
    if (enabled) {
      emit(HIGHLIGHT, highlightOptions);
    }

    const root = document.getElementById('storybook-root');
    const elements = highlightOptions.selectors.reduce((acc, selector) => {
      // Elements matching the selector, excluding storybook elements and their descendants.
      // Necessary to find portaled elements (e.g. children of `body`).
      document
        .querySelectorAll(
          `:is(${selector}):not([id^="storybook-"], [id^="storybook-"] *, [class^="sb-"], [class^="sb-"] *)`
        )
        .forEach((element) => acc.add(element));

      // Elements matching the selector inside the storybook root, as these were excluded above.
      (root?.querySelectorAll(selector) ?? []).forEach((element) => acc.add(element));

      return acc;
    }, new Set());
    emit(HIGHLIGHT_IGNORED_COUNT, elements.size);

    return () => emit(REMOVE_HIGHLIGHT, HIGHLIGHT_IGNORED_ID);
  }, [emit, highlightOptions, id, selectorKey, enabled]);

  return Story();
};

export const decorators = [WithIgnoreHighlight];

export const initialGlobals = {
  [HIGHLIGHT_IGNORED_PARAM]: false,
};
