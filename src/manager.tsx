import React from 'react';
import { type Addon_TestProviderType, Addon_TypesEnum } from 'storybook/internal/types';
import { addons, experimental_getStatusStore } from 'storybook/manager-api';

import { ADDON_ID, PANEL_ID, PARAM_KEY, TEST_PROVIDER_ID } from './constants';
import { Panel } from './Panel';
import { TestingModule } from './TestingModule';

addons.register(ADDON_ID, (api) => {
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
    name: 'Visual tests',
    render: () => <TestingModule />,
  } satisfies Omit<Addon_TestProviderType, 'id'>);
});
