import React from 'react';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';
import {
  ButtonRow,
  ButtonStack,
  ShareContainer,
  ShareDescription,
  ShareTextLink,
  ShareTitle,
  StatusRow,
  TextBlock,
} from './ShareSectionPrimitives';

const Digits = styled.ol(({ theme }) => ({
  display: 'inline-flex',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  gap: 5,

  'li:not(:empty)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px dashed ${theme.input.border}`,
    borderRadius: 4,
    width: 28,
    height: 32,
    fontWeight: 'bold' as const,
    fontSize: 14,
  },
}));

const PulsingDot = styled.div(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.color.positive,
  animation: 'pulse 1.5s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.4 },
  },
}));

interface ShareSectionVerifyingProps {
  userCode: string;
  onGoToChromatic: () => void;
  onBack: () => void;
}

export const ShareSectionVerifying = ({
  userCode,
  onGoToChromatic,
  onBack,
}: ShareSectionVerifyingProps) => (
  <ShareContainer>
    <TextBlock>
      <ShareTitle>Verify your account</ShareTitle>
      <ShareDescription>
        Enter this verification code on Chromatic to grant access to your published Storybooks.
      </ShareDescription>
    </TextBlock>
    <Digits>
      {userCode.split('').map((char, index) => (
        <li key={`${index}-${char}`}>{char.replace(/[^A-Z0-9]/i, '')}</li>
      ))}
    </Digits>
    <ButtonStack>
      <ButtonRow>
        <Button size="medium" variant="solid" onClick={onGoToChromatic}>
          Go to Chromatic
        </Button>
        <StatusRow>
          <PulsingDot />
          Waiting for verification...
        </StatusRow>
      </ButtonRow>
      <ShareTextLink onClick={onBack}>Back to sign in</ShareTextLink>
    </ButtonStack>
  </ShareContainer>
);
