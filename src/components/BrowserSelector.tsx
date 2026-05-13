import React from 'react';
import { ActionList, PopoverProvider } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { Browser, BrowserInfo, ComparisonResult } from '../gql/graphql';
import { aggregateResult } from '../utils/aggregateResult';
import { ChromeIcon } from './icons/ChromeIcon';
import { EdgeIcon } from './icons/EdgeIcon';
import { FirefoxIcon } from './icons/FirefoxIcon';
import { SafariIcon } from './icons/SafariIcon';
import { StatusDot, StatusDotWrapper } from './StatusDot';

const browserIcons = {
  [Browser.Chrome]: <ChromeIcon alt="Chrome" />,
  [Browser.Firefox]: <FirefoxIcon alt="Firefox" />,
  [Browser.Safari]: <SafariIcon alt="Safari" />,
  [Browser.Edge]: <EdgeIcon alt="Edge" />,
} as const;

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

type BrowserData = Pick<BrowserInfo, 'id' | 'key' | 'name'>;

interface BrowserSelectorProps {
  isAccepted: boolean;
  selectedBrowser: BrowserData;
  browserResults: { browser: BrowserData; result?: ComparisonResult }[];
  onSelectBrowser: (browser: BrowserData) => void;
}

export const BrowserSelector = ({
  isAccepted,
  selectedBrowser,
  browserResults,
  onSelectBrowser,
}: BrowserSelectorProps) => {
  const aggregate = aggregateResult(browserResults.map(({ result }) => result));
  if (!aggregate) return null;

  let icon = browserIcons[selectedBrowser.key];
  if (
    !isAccepted &&
    ![ComparisonResult.Equal, ComparisonResult.Skipped].includes(aggregate) &&
    browserResults.length >= 2
  ) {
    icon = <StatusDotWrapper status={aggregate}>{icon}</StatusDotWrapper>;
  }

  if (browserResults.length === 1) {
    return (
      <ActionList.Button readOnly tooltip={`Tested in ${selectedBrowser.name}`}>
        <ActionList.Icon>{icon}</ActionList.Icon>
        <ButtonLabel>{selectedBrowser.name}</ButtonLabel>
      </ActionList.Button>
    );
  }

  const links = browserResults.map(({ browser, result }) => ({
    id: browser.id,
    title: browser.name,
    icon: browserIcons[browser.key],
    right: !isAccepted &&
      ![ComparisonResult.Equal, ComparisonResult.Skipped].includes(aggregate) && (
        <StatusDot status={result} />
      ),
    onClick: () => onSelectBrowser(browser),
    active: selectedBrowser.name === browser.name,
  }));

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
                <ActionList.Icon>{link.icon}</ActionList.Icon>
                <ItemLabel active={link.active}>{link.title}</ItemLabel>
                {link.right && <ActionList.Icon>{link.right}</ActionList.Icon>}
              </ActionList.Action>
            </ActionList.Item>
          ))}
        </ActionList>
      )}
    >
      <ActionList.Button size="small" ariaLabel="Switch browser">
        <ActionList.Icon>{icon}</ActionList.Icon>
        <ButtonLabel>{selectedBrowser.name}</ButtonLabel>
      </ActionList.Button>
    </PopoverProvider>
  );
};
