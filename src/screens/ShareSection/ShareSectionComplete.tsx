import React from 'react';
import { styled } from 'storybook/theming';

import {
  ShareContainer,
  ShareCTAButton,
  ShareDescription,
  ShareTextLink,
  ShareTitle,
} from './ShareSectionPrimitives';
import { UrlCopyField } from './UrlCopyField';
import { WhoHasAccess } from './WhoHasAccess';

const ShareLinkBlock = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

const TitleBlock = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const UrlStatusBlock = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

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
  padding: '8px 12px',
  alignItems: 'center',
}));

const InfoBannerText = styled.span(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  color: theme.color.defaultText,
  flex: 1,
  lineHeight: '20px',
}));

function formatRelativeTime(publishedAt: number): string {
  if (!Number.isFinite(publishedAt)) return 'some time ago';
  const elapsed = Date.now() - publishedAt;
  const minutes = Math.floor(elapsed / (60 * 1000));
  if (minutes < 60) {
    return `${Math.max(1, minutes)}m ago`;
  }
  const hours = Math.floor(elapsed / (60 * 60 * 1000));
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
  return `${days}d ago`;
}

function formatExpiryDays(publishedAt: number): number {
  if (!Number.isFinite(publishedAt)) return 30;
  return Math.max(
    0,
    Math.round((publishedAt + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))
  );
}

interface ShareSectionCompleteProps {
  shareUrl: string;
  publishedAt: number;
  hasChanges: boolean;
  onPublishAgain: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
}

export const ShareSectionComplete = ({
  shareUrl,
  publishedAt,
  hasChanges,
  onPublishAgain,
  onCopy,
  onDelete,
}: ShareSectionCompleteProps) => {
  return (
    <ShareContainer $gap={24}>
      <ShareLinkBlock>
        <TitleBlock>
          <ShareTitle>Copy link to published Storybook</ShareTitle>
          <ShareDescription>
            Share with collaborators to get feedback or reproduce issues.
          </ShareDescription>
        </TitleBlock>
        <UrlStatusBlock>
          <UrlCopyField url={shareUrl} onCopy={onCopy} />
          {!hasChanges ? (
            <SuccessRow>
              <span>🎉</span>
              <SuccessText>Storybook published!</SuccessText>
            </SuccessRow>
          ) : (
            <>
              <TimestampRow>
                <span style={{ fontSize: 12, flexShrink: 0 }}>⏳</span>
                <TimestampText>
                  Published {formatRelativeTime(publishedAt)} – expires in{' '}
                  {formatExpiryDays(publishedAt)} days
                </TimestampText>
                <ShareTextLink onClick={onDelete}>Delete</ShareTextLink>
              </TimestampRow>
              <InfoBanner>
                <InfoBannerText>
                  Changes have been made since you last published this Storybook.
                </InfoBannerText>
                <ShareCTAButton style={{ width: 83 }} onClick={onPublishAgain}>
                  Republish
                </ShareCTAButton>
              </InfoBanner>
            </>
          )}
        </UrlStatusBlock>
      </ShareLinkBlock>
      <WhoHasAccess />
    </ShareContainer>
  );
};
