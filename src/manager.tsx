import React from 'react';
import type { ClickEventDetails } from 'storybook/highlight';
import { type Addon_TestProviderType, Addon_TypesEnum } from 'storybook/internal/types';
import { addons, experimental_getStatusStore } from 'storybook/manager-api';

import { GlobalIgnoreToggle } from './components/GlobalIgnoreToggle.tsx';
import {
  ADDON_ID,
  HIGHLIGHT_IGNORED_DEFAULT_SELECTORS,
  HIGHLIGHT_IGNORED_SELECT,
  PANEL_ID,
  PARAM_KEY,
  TEST_PROVIDER_ID,
} from './constants.ts';
import { Panel } from './Panel';
import { ShareToolbarButton } from './screens/ShareSection';
import { TestProviderRender } from './TestProviderRender';

// OAuth redirect handler
if (window.opener && !window.opener.closed) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (code && state) {
    window.opener.postMessage({ message: 'grant', code, state }, window.location.origin);
    window.close();
  } else if (error) {
    const errorDescription = params.get('error_description');
    window.opener.postMessage(
      {
        message: 'grant',
        error,
        ...(errorDescription ? { error_description: errorDescription } : {}),
        ...(state ? { state } : {}),
      },
      window.location.origin
    );
    window.close();
  }
}

addons.register(ADDON_ID, (api) => {
  api.on(HIGHLIGHT_IGNORED_SELECT, (_itemId: string, details: ClickEventDetails) => {
    const isDefaultSelector = HIGHLIGHT_IGNORED_DEFAULT_SELECTORS.includes(details.selectors[0]);
    window.open(
      isDefaultSelector
        ? 'https://www.chromatic.com/docs/ignoring-elements/#ignoring-elements-inline'
        : 'https://www.chromatic.com/docs/ignoring-elements/#ignoring-elements-via-test-configuration',
      '_blank'
    );
  });

  addons.add(`${ADDON_ID}/ignore-highlight-tool`, {
    type: Addon_TypesEnum.TOOL,
    title: 'Highlight ignored areas',
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <GlobalIgnoreToggle />,
  });

  addons.add(PANEL_ID, {
    type: Addon_TypesEnum.PANEL,
    title: 'Visual tests',
    paramKey: PARAM_KEY,
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => <Panel active={!!active} api={api} />,
  });

  if (globalThis.CONFIG_TYPE !== 'DEVELOPMENT') {
    return;
  }

  const statusStore = experimental_getStatusStore(ADDON_ID);

  statusStore.onSelect(() => {
    api.setSelectedPanel(PANEL_ID);
    api.togglePanel(true);
  });

  addons.add(TEST_PROVIDER_ID, {
    type: Addon_TypesEnum.experimental_TEST_PROVIDER,
    render: () => <TestProviderRender />,
  } satisfies Omit<Addon_TestProviderType, 'id'>);

  addons.add(`${ADDON_ID}/share-tool`, {
    type: Addon_TypesEnum.TOOLEXTRA,
    title: 'Share',
    render: () => <ShareToolbarButton api={api} />,
  });
});
