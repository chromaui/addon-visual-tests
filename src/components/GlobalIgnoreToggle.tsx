import { ContrastIgnoredIcon } from '@storybook/icons';
import React, { useState } from 'react';
import { ToggleButton } from 'storybook/internal/components';
import { useChannel, useGlobals } from 'storybook/manager-api';

import { HIGHLIGHT_IGNORED_COUNT, HIGHLIGHT_IGNORED_PARAM } from '../constants';

type GlobalIgnoreToggleButtonProps = {
  enabled: boolean;
  ignoreCount: number;
  locked: boolean;
  onToggle: () => void;
};

export const GlobalIgnoreToggleButton = ({
  enabled,
  ignoreCount,
  locked,
  onToggle,
}: GlobalIgnoreToggleButtonProps) => {
  return ignoreCount === 0 ? null : (
    <ToggleButton
      key={HIGHLIGHT_IGNORED_PARAM}
      pressed={enabled}
      ariaLabel={
        locked
          ? `Highlights ${enabled ? 'enabled' : 'disabled'} by story globals`
          : 'Highlight ignored areas'
      }
      padding="small"
      variant="ghost"
      disabled={locked}
      onClick={onToggle}
    >
      <ContrastIgnoredIcon />
      {ignoreCount}
    </ToggleButton>
  );
};

export const GlobalIgnoreToggle = () => {
  const [globals, updateGlobals, storyGlobals] = useGlobals();
  const [ignoreCount, setIgnoreCount] = useState(0);
  const enabled = !!globals[HIGHLIGHT_IGNORED_PARAM];
  const locked = HIGHLIGHT_IGNORED_PARAM in storyGlobals;

  useChannel({ [HIGHLIGHT_IGNORED_COUNT]: setIgnoreCount }, []);

  return (
    <GlobalIgnoreToggleButton
      enabled={enabled}
      ignoreCount={ignoreCount}
      locked={locked}
      onToggle={() =>
        updateGlobals({ [HIGHLIGHT_IGNORED_PARAM]: !globals[HIGHLIGHT_IGNORED_PARAM] })
      }
    />
  );
};
