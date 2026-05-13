import React from 'react';
import { Button, PopoverProvider } from 'storybook/internal/components';
import type { API } from 'storybook/manager-api';

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
    <Button variant="ghost" padding="small" id="chromatic-share-button">
      Share
    </Button>
  </PopoverProvider>
);
