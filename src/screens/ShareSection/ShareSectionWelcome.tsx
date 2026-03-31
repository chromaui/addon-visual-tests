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

interface ShareSectionWelcomeProps {
  onPublish: () => void;
}

export const ShareSectionWelcome = ({ onPublish }: ShareSectionWelcomeProps) => (
  <ShareContainer $gap={24}>
    <TextBlock>
      <ShareTitle>Publish a build to share</ShareTitle>
      <ShareDescription>
        This Storybook will be uploaded and available to collaborators for feedback.
      </ShareDescription>
    </TextBlock>
    <ShareCTAButton onClick={onPublish}>Publish &amp; copy link</ShareCTAButton>
    <WhoHasAccess />
  </ShareContainer>
);
