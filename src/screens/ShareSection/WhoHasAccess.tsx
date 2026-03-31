import { ChevronSmallRightIcon, GlobeIcon } from '@storybook/icons';
import React from 'react';
import { styled, useTheme } from 'storybook/theming';

import { ShareTitle } from './ShareSectionPrimitives';

const WhoHasAccessBlock = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const AccessRow = styled.div({
  display: 'flex',
  flexDirection: 'row',
  gap: 8,
  alignItems: 'center',
  width: '100%',
  overflow: 'hidden',
  borderRadius: 4,
});

const AccessText = styled.span(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  color: theme.color.defaultText,
  flex: 1,
  lineHeight: '20px',
}));

const LearnMoreLink = styled.a(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  flexShrink: 0,
  color: theme.color.secondary,
  fontSize: theme.typography.size.s2,
  lineHeight: '20px',
  cursor: 'pointer',
  textDecoration: 'none',
}));

export const WhoHasAccess = () => {
  const theme = useTheme();

  return (
    <WhoHasAccessBlock>
      <ShareTitle>Who has access</ShareTitle>
      <AccessRow>
        <GlobeIcon
          size={14}
          color={theme.textMutedColor}
          style={{ flexShrink: 0, borderRadius: 6 }}
        />
        <AccessText>Anyone with the link</AccessText>
        <LearnMoreLink
          href="https://www.chromatic.com/docs/sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
          <ChevronSmallRightIcon size={14} />
        </LearnMoreLink>
      </AccessRow>
    </WhoHasAccessBlock>
  );
};
