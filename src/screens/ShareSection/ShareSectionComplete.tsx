import { addDays, differenceInDays } from 'date-fns';
import React from 'react';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';
import { SHARE_EXPIRY_DAYS } from '../../constants';
import { formatDate } from '../../utils/formatDate';
import {
  ButtonStack,
  ShareContainer,
  ShareDescription,
  ShareTitle,
  TextBlock,
} from './ShareSectionPrimitives';
import { UrlCopyField } from './UrlCopyField';
import { WhoHasAccess } from './WhoHasAccess';

const SuccessRow = styled.div({
  display: 'flex',
  flexDirection: 'row',
  gap: 6,
  alignItems: 'center',
});

const SuccessText = styled.span(({ theme }) => ({
  fontSize: theme.typography.size.s1,
  color: theme.color.defaultText,
  lineHeight: '16px',
  flex: 1,
}));

const TimestampRow = styled.div({
  display: 'flex',
  flexDirection: 'row',
  gap: 6,
  alignItems: 'center',
});

const TimestampText = styled.span(({ theme }) => ({
  fontSize: theme.typography.size.s1,
  color: theme.color.defaultText,
  lineHeight: '16px',
  flexShrink: 0,
}));

const InfoBanner = styled.div(({ theme }) => ({
  backgroundColor: theme.background.hoverable,
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: 4,
  display: 'flex',
  gap: 16,
  marginTop: 8,
  padding: '8px 12px',
  alignItems: 'center',
}));

const InfoBannerText = styled.span(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  color: theme.color.defaultText,
  flex: 1,
  lineHeight: '20px',
}));

interface ShareSectionCompleteProps {
  shareUrl: string;
  publishedAt: number;
  isOutdated: boolean;
  onPublishAgain: () => void;
  onCopy?: () => void;
}

export const ShareSectionComplete = ({
  shareUrl,
  publishedAt,
  isOutdated,
  onPublishAgain,
  onCopy,
}: ShareSectionCompleteProps) => {
  return (
    <ShareContainer>
      <TextBlock>
        <ShareTitle>Copy link to published Storybook</ShareTitle>
        <ShareDescription>
          Share with collaborators to get feedback or reproduce issues.
        </ShareDescription>
      </TextBlock>
      <ButtonStack>
        <UrlCopyField url={shareUrl} onCopy={onCopy} />
        {!isOutdated && (
          <SuccessRow>
            <span>🎉</span>
            <SuccessText>Storybook published!</SuccessText>
          </SuccessRow>
        )}
        <TimestampRow>
          <span style={{ fontSize: 12, flexShrink: 0 }}>⏳</span>
          <TimestampText>
            Published {formatDate(publishedAt)} – expires in{' '}
            {Math.max(0, differenceInDays(addDays(publishedAt, SHARE_EXPIRY_DAYS), Date.now()))}{' '}
            days
          </TimestampText>
        </TimestampRow>
        {isOutdated && (
          <InfoBanner>
            <InfoBannerText>
              Changes have been made since you last published this Storybook.
            </InfoBannerText>
            <Button size="medium" variant="solid" onClick={onPublishAgain}>
              Republish
            </Button>
          </InfoBanner>
        )}
      </ButtonStack>
      <WhoHasAccess />
    </ShareContainer>
  );
};
