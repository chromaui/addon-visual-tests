import React from 'react';

import { Button } from '../../components/Button';
import { ShareContainer, ShareDescription, ShareTitle, TextBlock } from './SharePopupPrimitives';
import { WhoHasAccess } from './WhoHasAccess';

interface SharePopupWelcomeProps {
  onPublish: () => void;
}

export const SharePopupWelcome = ({ onPublish }: SharePopupWelcomeProps) => (
  <ShareContainer>
    <TextBlock>
      <ShareTitle>Publish a build to share</ShareTitle>
      <ShareDescription>
        This Storybook will be uploaded and available to collaborators for feedback.
      </ShareDescription>
    </TextBlock>
    <Button size="medium" variant="solid" onClick={onPublish}>
      Publish &amp; copy link
    </Button>
    <WhoHasAccess />
  </ShareContainer>
);
