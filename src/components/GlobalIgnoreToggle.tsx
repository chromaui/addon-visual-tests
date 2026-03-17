import { ContrastIgnoredIcon } from '@storybook/icons';
import React, { useState } from 'react';
import { IconButton } from 'storybook/internal/components';
import { useChannel, useGlobals } from 'storybook/manager-api';

import { IGNORE_HIGHLIGHT_COUNT, IGNORE_HIGHLIGHT_KEY } from '../constants';

export const GlobalIgnoreToggle = () => {
  const [, updateGlobals, , userGlobals] = useGlobals();
  const [ignoreCount, setIgnoreCount] = useState(0);
  const enabled = !!userGlobals[IGNORE_HIGHLIGHT_KEY];

  useChannel({ [IGNORE_HIGHLIGHT_COUNT]: setIgnoreCount }, []);

  return ignoreCount === 0 ? null : (
    <IconButton
      key={IGNORE_HIGHLIGHT_KEY}
      active={enabled}
      ariaLabel={enabled ? 'Hide ignored areas' : 'Show ignored areas'}
      padding="small"
      variant="ghost"
      onClick={() => updateGlobals({ [IGNORE_HIGHLIGHT_KEY]: !userGlobals[IGNORE_HIGHLIGHT_KEY] })}
    >
      <ContrastIgnoredIcon />
      {ignoreCount}
    </IconButton>
  );
};
