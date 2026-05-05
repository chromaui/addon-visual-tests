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

  const normalizeSubdomain = useCallback((value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+/, '')
      .replace(/-{2,}/g, '-');
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSubdomain(normalizeSubdomain(e.target.value));
      setInputError(null);
    },
    [normalizeSubdomain]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const normalized = subdomain.replace(/-+$/, '');
      if (normalized) onSubmit(normalized);
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
