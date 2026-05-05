import { WrenchIcon } from '@storybook/icons';
import React from 'react';

import type { ShareProgress } from '../../types';
import {
  ButtonStack,
  ShareContainer,
  ShareDescription,
  ShareTextLink,
  ShareTitle,
  StatusRow,
  TextBlock,
} from './ShareSectionPrimitives';
import { UrlCopyField } from './UrlCopyField';
import { WhoHasAccess } from './WhoHasAccess';

const statusLabels: Record<ShareProgress['status'], string> = {
  pending: 'Initializing build...',
  uploading: 'Publishing Storybook...',
  complete: 'Storybook published',
  error: 'Publishing failed',
};

interface ShareSectionUploadingProps {
  shareUrl?: string;
  step?: ShareProgress['status'];
  onCopy?: () => void;
  onCancel?: () => void;
}

export const ShareSectionUploading = ({
  shareUrl,
  step = 'pending',
  onCopy,
  onCancel,
}: ShareSectionUploadingProps) => {
  const canCancel = onCancel && step !== 'complete';
  return (
    <ShareContainer>
      <TextBlock>
        <ShareTitle>Publishing…</ShareTitle>
        <ShareDescription>
          Please don&apos;t modify code or switch branches until upload is complete.
        </ShareDescription>
      </TextBlock>
      <ButtonStack>
        <UrlCopyField url={shareUrl || undefined} onCopy={onCopy} />
        <StatusRow aria-live="polite">
          <WrenchIcon size={12} aria-hidden="true" />
          {statusLabels[step]}
        </StatusRow>
        {canCancel && (
          <ShareTextLink type="button" aria-label="Cancel publish" onClick={onCancel}>
            Cancel
          </ShareTextLink>
        )}
      </ButtonStack>
      <WhoHasAccess />
    </ShareContainer>
  );
};
