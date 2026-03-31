import { WrenchIcon } from '@storybook/icons';
import React from 'react';
import { styled } from 'storybook/theming';

import type { ShareProgress } from '../../types';
import { ShareContainer, ShareTitle } from './ShareSectionPrimitives';
import { UrlCopyField } from './UrlCopyField';

const ProgressBarContainer = styled.div(({ theme }) => ({
  height: 4,
  borderRadius: 2,
  backgroundColor: theme.appBorderColor,
  overflow: 'hidden',
}));

const ProgressBarFill = styled.div<{ $width?: number }>(({ theme, $width }) => ({
  height: '100%',
  borderRadius: 2,
  backgroundColor: theme.color.secondary,
  ...($width !== undefined
    ? {
        width: `${$width}%`,
        transition: 'width 0.3s ease',
      }
    : {
        animation: 'indeterminate 1.5s ease-in-out infinite',
        width: '40%',
        '@keyframes indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(350%)' },
        },
      }),
}));

const StatusRow = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: theme.typography.size.s1,
  color: theme.textMutedColor,
}));

const statusLabels: Record<ShareProgress['status'], string> = {
  pending: 'Initializing build...',
  uploading: 'Publishing Storybook...',
  complete: 'Storybook published',
  error: 'Publishing failed',
};

interface ShareSectionUploadingProps {
  shareUrl?: string;
  progress?: number;
  step?: ShareProgress['status'];
  onCopy?: () => void;
}

export const ShareSectionUploading = ({
  shareUrl,
  progress,
  step = 'pending',
  onCopy,
}: ShareSectionUploadingProps) => {
  return (
    <ShareContainer>
      <ShareTitle>Publishing your Storybook</ShareTitle>
      <UrlCopyField url={shareUrl || undefined} onCopy={onCopy} />
      <ProgressBarContainer>
        <ProgressBarFill $width={progress} />
      </ProgressBarContainer>
      <StatusRow>
        <WrenchIcon size={12} />
        {statusLabels[step]}
      </StatusRow>
    </ShareContainer>
  );
};
