import React from 'react';
import { css, styled } from 'storybook/theming';

import { ComparisonResult, TestStatus } from '../gql/graphql';

interface StatusDotProps {
  status?: TestStatus | ComparisonResult | 'positive' | 'negative' | 'warning' | 'notification';
}

const Dot = styled.div<StatusDotProps & { overlay?: boolean }>(
  ({ status, theme }) => ({
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background:
      status &&
      {
        [TestStatus.InProgress]: 'transparent',
        [TestStatus.Passed]: theme.color.positive,
        [TestStatus.Pending]: theme.color.gold,
        [TestStatus.Accepted]: theme.color.positive,
        [TestStatus.Denied]: theme.color.positive,
        [TestStatus.Broken]: theme.color.negative,
        [TestStatus.Failed]: theme.color.negative,
        [ComparisonResult.Skipped]: 'transparent',
        [ComparisonResult.Equal]: theme.color.positive,
        [ComparisonResult.Fixed]: theme.color.positive,
        [ComparisonResult.Added]: theme.color.gold,
        [ComparisonResult.Changed]: theme.color.gold,
        [ComparisonResult.Removed]: theme.color.gold,
        [ComparisonResult.CaptureError]: theme.color.negative,
        [ComparisonResult.SystemError]: theme.color.negative,
        positive: theme.color.positive,
        negative: theme.color.negative,
        warning: theme.color.gold,
        notification: theme.color.secondary,
      }[status],
  }),
  ({ overlay, theme }) =>
    overlay &&
    css({
      position: 'absolute',
      top: -1,
      right: -2,
      width: 7,
      height: 7,
      border: `1px solid rgba(0, 0, 0, 0.1)`,
      boxShadow: `0 0 0 2px var(--bg-color, ${theme.background.bar})`,
      boxSizing: 'border-box',
    })
);

export const StatusDot = ({ status }: StatusDotProps) => <Dot status={status} />;

const Wrapper = styled.div({
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',

  'img, svg': {
    verticalAlign: 'top',
  },
});

export const StatusDotWrapper = ({
  status,
  children,
}: StatusDotProps & { children: React.ReactNode }) => (
  <Wrapper>
    {children}
    <Dot overlay status={status} />
  </Wrapper>
);
