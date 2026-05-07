import { addDays } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';
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
  daysToExpire?: number;
  isOutdated: boolean;
  onPublishAgain: () => void;
  onCopy?: () => void;
}

const CELEBRATION_DURATION_MS = 5000;

export const ShareSectionComplete = ({
  shareUrl,
  publishedAt,
  daysToExpire,
  isOutdated,
  onPublishAgain,
  onCopy,
}: ShareSectionCompleteProps) => {
  const [showCelebration, setShowCelebration] = useState(
    () => Date.now() - publishedAt < CELEBRATION_DURATION_MS
  );

  useEffect(() => {
    if (!showCelebration) return;
    const remaining = CELEBRATION_DURATION_MS - (Date.now() - publishedAt);
    if (remaining <= 0) {
      setShowCelebration(false);
      return;
    }
    const timer = setTimeout(() => setShowCelebration(false), remaining);
    return () => clearTimeout(timer);
  }, [publishedAt, showCelebration]);

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
        {!isOutdated && showCelebration ? (
          <SuccessRow>
            <span>🎉</span>
            <SuccessText>Storybook published!</SuccessText>
          </SuccessRow>
        ) : (
          <TimestampRow>
            <span style={{ fontSize: 12, flexShrink: 0 }}>⏳</span>
            <TimestampText>
              Published {formatDate(publishedAt)}
              {daysToExpire !== undefined
                ? (() => {
                    const msRemaining = addDays(publishedAt, daysToExpire).getTime() - Date.now();
                    const daysRemaining = Math.max(0, Math.ceil(msRemaining / 86_400_000));
                    return ` – expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`;
                  })()
                : ''}
            </TimestampText>
          </TimestampRow>
        )}
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
