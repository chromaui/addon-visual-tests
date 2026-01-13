import { DiamondIcon } from '@storybook/icons';
import React from 'react';
import { ActionList, PopoverProvider } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { ComparisonResult, TestMode } from '../gql/graphql';
import { aggregateResult } from '../utils/aggregateResult';
import { StatusDot, StatusDotWrapper } from './StatusDot';

const ButtonLabel = styled(ActionList.Text)({
  display: 'none',

  '@container (min-width: 300px)': {
    display: 'inline-block',
  },
});

const ItemLabel = styled(ActionList.Text)<{ active?: boolean }>(({ theme, active }) => ({
  minWidth: 80,
  color: active ? theme.color.secondary : 'inherit',
  fontWeight: active ? theme.typography.weight.bold : 'inherit',
}));

type ModeData = Pick<TestMode, 'name'>;

interface ModeSelectorProps {
  isAccepted: boolean;
  modeOrder?: string[];
  modeResults: { mode: ModeData; result?: ComparisonResult }[];
  onSelectMode: (mode: ModeData) => void;
  selectedMode: ModeData;
}

export const ModeSelector = ({
  isAccepted,
  modeOrder,
  modeResults,
  onSelectMode,
  selectedMode,
}: ModeSelectorProps) => {
  const aggregate = aggregateResult(modeResults.map(({ result }) => result));
  if (!aggregate) return null;

  let icon = <DiamondIcon />;
  if (
    !isAccepted &&
    ![ComparisonResult.Equal, ComparisonResult.Skipped].includes(aggregate) &&
    modeResults.length >= 2
  ) {
    icon = <StatusDotWrapper status={aggregate}>{icon}</StatusDotWrapper>;
  }

  if (modeResults.length === 1) {
    return (
      <ActionList.Button readOnly tooltip={`View mode: ${selectedMode.name}`}>
        <ActionList.Icon>{icon}</ActionList.Icon>
        <ButtonLabel>{selectedMode.name}</ButtonLabel>
      </ActionList.Button>
    );
  }

  const links = modeResults
    .map(({ mode, result }) => ({
      id: mode.name,
      title: mode.name,
      right: !isAccepted &&
        ![ComparisonResult.Equal, ComparisonResult.Skipped].includes(aggregate) && (
          <StatusDot status={result} />
        ),
      onClick: () => onSelectMode(mode),
      active: selectedMode.name === mode.name,
    }))
    .sort((a, b) => {
      if (!modeOrder) return 0;
      const ia = modeOrder.indexOf(a.title);
      const ib = modeOrder.indexOf(b.title);
      return ia !== -1 && ib !== -1 ? ia - ib : 0;
    });

  return (
    <PopoverProvider
      padding={0}
      popover={({ onHide }) => (
        <ActionList>
          {links.map((link) => (
            <ActionList.Item key={link.id}>
              <ActionList.Action
                ariaLabel={false}
                onClick={() => {
                  link.onClick();
                  onHide();
                }}
              >
                <ItemLabel active={link.active}>{link.title}</ItemLabel>
                {link.right && <ActionList.Icon>{link.right}</ActionList.Icon>}
              </ActionList.Action>
            </ActionList.Item>
          ))}
        </ActionList>
      )}
    >
      <ActionList.Button size="small" ariaLabel="Switch mode">
        <ActionList.Icon>{icon}</ActionList.Icon>
        <ButtonLabel>{selectedMode.name}</ButtonLabel>
      </ActionList.Button>
    </PopoverProvider>
  );
};
