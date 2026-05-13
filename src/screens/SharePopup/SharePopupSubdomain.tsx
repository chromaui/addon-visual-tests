import { ChevronLeftIcon } from '@storybook/icons';
import React, { useCallback, useState } from 'react';
import { styled } from 'storybook/theming';

import { finalizeSubdomain, normalizeSubdomain } from '../../auth/subdomain';
import { Button } from '../../components/Button';
import { SuffixInput } from '../../components/SuffixInput';
import { ShareContainer, ShareDescription, ShareTitle, TextBlock } from './SharePopupPrimitives';
import { WhoHasAccess } from './WhoHasAccess';

const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'stretch',
});

const FormRow = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  '& > :first-child': {
    flex: 1,
    minWidth: 0,
  },
});

const RelativeContainer = styled(ShareContainer)({
  position: 'relative',
  paddingTop: 42,
});

const BackButton = styled(Button)({
  position: 'absolute',
  top: 6,
  left: 6,
});

interface SharePopupSubdomainProps {
  onSubmit: (subdomain: string) => void;
  onBack: () => void;
}

export const SharePopupSubdomain = ({ onSubmit, onBack }: SharePopupSubdomainProps) => {
  const [subdomain, setSubdomain] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSubdomain(normalizeSubdomain(e.target.value));
    setInputError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const normalized = finalizeSubdomain(subdomain);
      if (normalized) onSubmit(normalized);
      else setInputError('Please enter a subdomain');
    },
    [subdomain, onSubmit]
  );

  return (
    <RelativeContainer>
      <BackButton variant="ghost" onClick={onBack} aria-label="Back">
        <ChevronLeftIcon size={12} aria-hidden="true" />
        Back
      </BackButton>
      <TextBlock>
        <ShareTitle>Sign in with SSO</ShareTitle>
        <ShareDescription>Enter your team&apos;s Chromatic subdomain.</ShareDescription>
      </TextBlock>
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <SuffixInput
            autoFocus
            icon="users"
            value={subdomain}
            placeholder="yourteam"
            suffix=".chromatic.com"
            onChange={handleChange}
            id="share-subdomain-input"
            error={inputError}
            errorTooltipPlacement="top"
          />
          <Button size="medium" variant="solid" type="submit" style={{ flexShrink: 0 }}>
            Connect
          </Button>
        </FormRow>
      </Form>
      <WhoHasAccess />
    </RelativeContainer>
  );
};
