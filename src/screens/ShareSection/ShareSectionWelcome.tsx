import React from 'react';

import { Button } from '../../components/Button';
import { ShareContainer, ShareDescription, ShareTitle, TextBlock } from './ShareSectionPrimitives';
import { WhoHasAccess } from './WhoHasAccess';

interface ShareSectionWelcomeProps {
  onPublish: () => void;
}

export const ShareSectionWelcome = ({ onPublish }: ShareSectionWelcomeProps) => (
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
