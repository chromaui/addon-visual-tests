import React from 'react';
import { Button, PopoverProvider } from 'storybook/internal/components';
import type { API } from 'storybook/manager-api';

import { authStore } from '../../auth/authStore';
import { SHARE_TELEMETRY } from '../../constants';
import type { TelemetryAction } from '../../utils/TelemetryContext';
import { SharePopup } from './SharePopup';

export const ShareToolbarButton = ({ api }: { api: API }) => (
  <PopoverProvider
    hasChrome
    hasCloseButton
    ariaLabel="Share your Storybook"
    placement="bottom"
    padding={0}
    popover={<SharePopup api={api} />}
    onVisibleChange={(visible) => {
      if (!visible) return;
      api.getChannel()?.emit(SHARE_TELEMETRY, {
        action: 'openShare' satisfies TelemetryAction,
        entryPoint: 'toolbar',
        location: 'SharePopup',
        signedIn: Boolean(authStore.getToken()),
      });
    }}
  >
    <Button variant="ghost" padding="small" id="chromatic-share-button">
      Share
    </Button>
  </PopoverProvider>
);
