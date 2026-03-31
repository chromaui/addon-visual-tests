import React from 'react';
import { Button, PopoverProvider } from 'storybook/internal/components';
import type { API, Combo } from 'storybook/manager-api';
import { Consumer } from 'storybook/manager-api';

import { ShareSection } from './ShareSection';

export const ShareToolbarButton = ({ api }: { api: API }) => (
  <Consumer filter={({ state }: Combo) => ({ storyId: state.storyId })}>
    {({ storyId }) => (
      <PopoverProvider
        hasChrome
        hasCloseButton
        ariaLabel="Share your Storybook"
        placement="bottom"
        padding={0}
        popover={<ShareSection storyId={storyId} api={api} />}
      >
        <Button variant="ghost" padding="small">
          Share
        </Button>
      </PopoverProvider>
    )}
  </Consumer>
);
