import React from 'react';
import { styled } from 'storybook/theming';

import {
  ShareContainer,
  ShareCTAButton,
  ShareDescription,
  ShareTitle,
} from './ShareSectionPrimitives';
import { WhoHasAccess } from './WhoHasAccess';

const TextBlock = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const ButtonGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const ErrorRow = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

const ErrorBadge = styled.span(({ theme }) => ({
  backgroundColor: theme.color.negative,
  color: theme.color.lightest,
  fontSize: theme.typography.size.s1,
  fontWeight: theme.typography.weight.bold,
  borderRadius: 4,
  padding: '2px 6px',
  lineHeight: '16px',
  flexShrink: 0,
}));

const ErrorMessage = styled.span(({ theme }) => ({
  color: theme.textMutedColor,
  fontSize: theme.typography.size.s1,
  lineHeight: '16px',
}));

interface ShareSectionErrorProps {
  reason: 'cancelled' | 'expired' | 'unknown';
  onRetry: () => void;
}

const reasonMessages: Record<ShareSectionErrorProps['reason'], string> = {
  cancelled: 'Sign-in was not completed',
  expired: 'Sign-in link expired',
  unknown: 'Something went wrong',
};

export const ShareSectionError = ({ reason, onRetry }: ShareSectionErrorProps) => {
  const mappedReason = reasonMessages[reason];

  return (
    <ShareContainer $gap={24}>
      <TextBlock>
        <ShareTitle>Publish a build to share</ShareTitle>
        <ShareDescription>
          This Storybook will be uploaded and available to collaborators for feedback.
        </ShareDescription>
      </TextBlock>
      <ButtonGroup>
        <ShareCTAButton onClick={onRetry}>Publish &amp; copy link</ShareCTAButton>
        <ErrorRow>
          <ErrorBadge>Error</ErrorBadge>
          <ErrorMessage>Publish failed: {mappedReason}</ErrorMessage>
        </ErrorRow>
      </ButtonGroup>
      <WhoHasAccess />
    </ShareContainer>
  );
};
