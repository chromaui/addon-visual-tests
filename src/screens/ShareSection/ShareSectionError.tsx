import React from 'react';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';
import {
  ButtonStack,
  ShareContainer,
  ShareDescription,
  ShareTitle,
  StatusRow,
  TextBlock,
} from './ShareSectionPrimitives';
import { WhoHasAccess } from './WhoHasAccess';

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
  unknown: '',
};

export const ShareSectionError = ({ reason, onRetry }: ShareSectionErrorProps) => {
  const mappedReason = reasonMessages[reason];

  return (
    <ShareContainer>
      <TextBlock>
        <ShareTitle>Publish a build to share</ShareTitle>
        <ShareDescription>
          This Storybook will be uploaded and available to collaborators for feedback.
        </ShareDescription>
      </TextBlock>
      <ButtonStack>
        <Button size="medium" variant="solid" onClick={onRetry}>
          Publish &amp; copy link
        </Button>
        <StatusRow>
          <ErrorBadge>Error</ErrorBadge>
          <ErrorMessage>
            <strong>Publish failed{mappedReason && ':'}</strong> {mappedReason}
          </ErrorMessage>
        </StatusRow>
      </ButtonStack>
      <WhoHasAccess />
    </ShareContainer>
  );
};
