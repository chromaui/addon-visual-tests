import React from 'react';

import { Button } from '../../components/Button';
import {
  ButtonStack,
  ShareContainer,
  ShareDescription,
  ShareTextLink,
  ShareTitle,
  TextBlock,
} from './ShareSectionPrimitives';

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
      <Button size="medium" variant="solid" onClick={onSignIn}>
        Sign in with Chromatic
      </Button>
      <ShareTextLink onClick={onSignIn}>Connect with SAML SSO</ShareTextLink>
    </ButtonStack>
  </ShareContainer>
);
