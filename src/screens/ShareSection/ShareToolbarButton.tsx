import React from 'react';
import { Button, PopoverProvider } from 'storybook/internal/components';
import type { API } from 'storybook/manager-api';

import { ShareSection } from './ShareSection';

export const ShareToolbarButton = ({ api }: { api: API }) => (
  <PopoverProvider
    hasChrome
    hasCloseButton
    ariaLabel="Share your Storybook"
    placement="bottom"
    padding={0}
    popover={<ShareSection api={api} />}
  >
    <Button variant="ghost" padding="small" id="chromatic-share-button">
      Share
    </Button>
  </PopoverProvider>
);
