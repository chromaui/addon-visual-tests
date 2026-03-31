import React from 'react';
import { styled } from 'storybook/theming';

import { ShareContainer, ShareTextLink, ShareTitle } from './ShareSectionPrimitives';

const VerifyDescription = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s1,
  color: theme.textMutedColor,
  lineHeight: '18px',
}));

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

const StatusRow = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: theme.typography.size.s1,
  color: theme.textMutedColor,
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
  onBack: () => void;
}

export const ShareSectionVerifying = ({ userCode, onBack }: ShareSectionVerifyingProps) => (
  <ShareContainer>
    <ShareTitle>Verify your account</ShareTitle>
    <VerifyDescription>Enter this code on Chromatic to share your Storybook.</VerifyDescription>
    <Digits>
      {userCode.split('').map((char, index) => (
        <li key={`${index}-${char}`}>{char.replace(/[^A-Z0-9]/i, '')}</li>
      ))}
    </Digits>
    <StatusRow>
      <PulsingDot />
      Waiting for verification...
    </StatusRow>
    <ShareTextLink onClick={onBack}>&larr; Back to sign in</ShareTextLink>
  </ShareContainer>
);
