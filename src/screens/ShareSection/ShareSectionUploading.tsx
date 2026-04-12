import { WrenchIcon } from '@storybook/icons';
import React from 'react';

import type { ShareProgress } from '../../types';
import {
  ButtonStack,
  ShareContainer,
  ShareDescription,
  ShareTitle,
  StatusRow,
  TextBlock,
} from './ShareSectionPrimitives';
import { UrlCopyField } from './UrlCopyField';

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
  step = 'pending',
  onCopy,
}: ShareSectionUploadingProps) => {
  return (
    <ShareContainer>
      <TextBlock>
        <ShareTitle>Publishing your Storybook</ShareTitle>
        <ShareDescription>
          Please don&apos;t modify code or switch branches until upload is complete.
        </ShareDescription>
      </TextBlock>
      <ButtonStack>
        <UrlCopyField url={shareUrl || undefined} onCopy={onCopy} />
        <StatusRow>
          <WrenchIcon size={12} />
          {statusLabels[step]}
        </StatusRow>
      </ButtonStack>
    </ShareContainer>
  );
};
