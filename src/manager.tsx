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
  SHARE_PROGRESS,
  TEST_PROVIDER_ID,
} from './constants.ts';
import { Panel } from './Panel';
import { isSharePopupOpen } from './screens/SharePopup/SharePopup';
import { ShareToolbarButton } from './screens/SharePopup/ShareToolbarButton';
import { TestProviderRender } from './TestProviderRender';
import type { ShareProgress } from './types';
import { SharedState } from './utils/SharedState';

// OAuth redirect handler
if (window.opener && !window.opener.closed) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (code && state) {
    window.opener.postMessage({ message: 'grant', code, state }, window.location.origin);
    window.close();
  } else if (error && state) {
    const errorDescription = params.get('error_description');
    window.opener.postMessage(
      {
        message: 'grant',
        error,
        state,
        ...(errorDescription ? { error_description: errorDescription } : {}),
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
    render: ({ active }) => <Panel active={!!active} />,
  });

  // Surface a Storybook notification when a share completes — but only when the
  // share popover is closed. While the popover is open, SharePopup itself
  // shows the completion state, so a duplicate toast would be noise.
  const channel = api.getChannel();
  if (channel) {
    let lastNotifiedShareUrl: string | null = null;
    const shareProgressState = SharedState.subscribe<ShareProgress>(SHARE_PROGRESS, channel);
    shareProgressState.on('change', (progress) => {
      if (progress?.status !== 'complete') return;
      if (progress.shareUrl === lastNotifiedShareUrl || isSharePopupOpen()) return;
      const { shareUrl } = progress;
      lastNotifiedShareUrl = shareUrl;
      api.addNotification({
        id: `${ADDON_ID}/share-published`,
        content: {
          headline: 'Storybook published!',
          subHeadline: shareUrl,
        },
        duration: 8_000,
        onClick: ({ onDismiss }: { onDismiss: () => void }) => {
          navigator.clipboard.writeText(shareUrl).catch(() => {});
          onDismiss();
        },
      });
    });
  }

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
    clear: () => {
      statusStore.unset();
    },
    render: () => <TestProviderRender />,
  } as Omit<Addon_TestProviderType, 'id'>);

  addons.add(`${ADDON_ID}/share-tool`, {
    type: Addon_TypesEnum.TOOLEXTRA,
    title: 'Share',
    render: () => <ShareToolbarButton api={api} />,
  });
});
