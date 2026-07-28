import React from 'react';
import { Button, PopoverProvider } from 'storybook/internal/components';
import type { API } from 'storybook/manager-api';

import { TELEMETRY } from '../../constants';
import { SharePopup } from './SharePopup';

export const ShareToolbarButton = ({ api }: { api: API }) => (
  <PopoverProvider
    hasChrome
    hasCloseButton
    ariaLabel="Share your Storybook"
    placement="bottom"
    padding={0}
    popover={<SharePopup api={api} />}
  >
    <Button
      variant="ghost"
      padding="small"
      id="chromatic-share-button"
      onClick={() =>
        api.getChannel()?.emit(TELEMETRY, {
          action: 'openShare',
          entryPoint: 'toolbar',
          location: 'SharePopup',
          screen: 'Toolbar',
        })
      }
    >
      Share
    </Button>
  </PopoverProvider>
);
