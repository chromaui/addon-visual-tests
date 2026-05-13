import React from 'react';

import { Button } from '../../components/Button';
import {
  ButtonStack,
  ShareContainer,
  ShareDescription,
  ShareTextLink,
  ShareTitle,
  TextBlock,
} from './SharePopupPrimitives';
import { WhoHasAccess } from './WhoHasAccess';

interface SharePopupIdleProps {
  onSignIn: () => void;
  onSignInWithSSO: () => void;
}

export const SharePopupIdle = ({ onSignIn, onSignInWithSSO }: SharePopupIdleProps) => (
  <ShareContainer>
    <TextBlock>
      <ShareTitle>Publish and share builds</ShareTitle>
      <ShareDescription>
        This Storybook will be uploaded and available to collaborators for feedback.
      </ShareDescription>
    </TextBlock>
    <ButtonStack>
      <Button size="medium" variant="solid" onClick={onSignIn}>
        Sign in with Chromatic
      </Button>
      <ShareTextLink onClick={onSignInWithSSO}>Connect with SAML SSO</ShareTextLink>
    </ButtonStack>
    <WhoHasAccess />
  </ShareContainer>
);
