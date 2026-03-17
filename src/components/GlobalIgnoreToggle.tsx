import { ContrastIgnoredIcon } from '@storybook/icons';
import React, { useState } from 'react';
import { IconButton } from 'storybook/internal/components';
import { useChannel, useGlobals } from 'storybook/manager-api';

import { IGNORE_HIGHLIGHT_COUNT, IGNORE_HIGHLIGHT_KEY } from '../constants';

export const GlobalIgnoreToggle = () => {
  const [globals, updateGlobals, storyGlobals] = useGlobals();
  const [ignoreCount, setIgnoreCount] = useState(0);
  const enabled = !!globals[IGNORE_HIGHLIGHT_KEY];
  const locked = IGNORE_HIGHLIGHT_KEY in storyGlobals;

  useChannel({ [IGNORE_HIGHLIGHT_COUNT]: setIgnoreCount }, []);

  return ignoreCount === 0 ? null : (
    <IconButton
      key={IGNORE_HIGHLIGHT_KEY}
      active={enabled}
      ariaLabel={
        locked
          ? `Highlights ${enabled ? 'enabled' : 'disabled'} by story globals`
          : `${enabled ? 'Hide' : 'Show'} ignored areas`
      }
      padding="small"
      variant="ghost"
      disabled={locked}
      onClick={() => updateGlobals({ [IGNORE_HIGHLIGHT_KEY]: !globals[IGNORE_HIGHLIGHT_KEY] })}
    >
      <ContrastIgnoredIcon />
      {ignoreCount}
    </IconButton>
  );
};
