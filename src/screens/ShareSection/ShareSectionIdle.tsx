import React from 'react';
import { styled } from 'storybook/theming';

import {
  ShareContainer,
  ShareCTAButton,
  ShareDescription,
  ShareTextLink,
  ShareTitle,
} from './ShareSectionPrimitives';

const TextBlock = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const ButtonStack = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
});

interface ShareSectionIdleProps {
  onSignIn: () => void;
}

export const ShareSectionIdle = ({ onSignIn }: ShareSectionIdleProps) => (
  <ShareContainer>
    <TextBlock>
      <ShareTitle>Publish and share local builds</ShareTitle>
      <ShareDescription>
        This Storybook will be uploaded and available to collaborators for feedback.
      </ShareDescription>
    </TextBlock>
    <ButtonStack>
      <ShareCTAButton style={{ width: 166 }} onClick={onSignIn}>
        Sign in with Chromatic
      </ShareCTAButton>
      <ShareTextLink $underline onClick={onSignIn}>
        Connect with SAML SSO
      </ShareTextLink>
    </ButtonStack>
  </ShareContainer>
);
