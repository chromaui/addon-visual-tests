import React, { useCallback, useState } from 'react';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';
import { SuffixInput } from '../../components/SuffixInput';
import {
  ButtonStack,
  ShareContainer,
  ShareDescription,
  ShareTextLink,
  ShareTitle,
  TextBlock,
} from './ShareSectionPrimitives';

const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'stretch',
  gap: 8,
});

interface ShareSectionSubdomainProps {
  onSubmit: (subdomain: string) => void;
  onBack: () => void;
}

export const ShareSectionSubdomain = ({ onSubmit, onBack }: ShareSectionSubdomainProps) => {
  const [subdomain, setSubdomain] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSubdomain(e.target.value.replace(/[^a-z0-9-]/g, ''));
    setInputError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (subdomain) onSubmit(subdomain);
      else setInputError('Please enter a subdomain');
    },
    [subdomain, onSubmit]
  );

  return (
    <ShareContainer>
      <TextBlock>
        <ShareTitle>Sign in with SSO</ShareTitle>
        <ShareDescription>Enter your team&apos;s Chromatic subdomain.</ShareDescription>
      </TextBlock>
      <Form onSubmit={handleSubmit}>
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
        <ButtonStack>
          <Button size="medium" variant="solid" type="submit">
            Continue
          </Button>
          <ShareTextLink type="button" onClick={onBack}>
            Back
          </ShareTextLink>
        </ButtonStack>
      </Form>
    </ShareContainer>
  );
};
