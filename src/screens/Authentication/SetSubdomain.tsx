import React, { useCallback, useState } from 'react';
import { Button } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { ChromaticIcon } from '../../components/icons/ChromaticIcon';
import { Screen } from '../../components/Screen';
import { Stack as BaseStack } from '../../components/Stack';
import { SuffixInput } from '../../components/SuffixInput';
import { Text } from '../../components/Text';
import { AuthHeader } from './AuthHeader';

const Stack = styled(BaseStack)({
  alignSelf: 'stretch',
});

const Icon = styled(ChromaticIcon)({
  width: 40,
  height: 40,
  filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1))',
  marginBottom: 10,
});

const Form = styled.form({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: 300,
  margin: 10,
});

const SubmitButton = styled(Button)({
  '&&': {
    fontSize: 13,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});

interface SetSubdomainProps {
  onBack: () => void;
  onSignIn: (subdomain: string) => void;
}

export const SetSubdomain = ({ onBack, onSignIn }: SetSubdomainProps) => {
  const [subdomain, setSubdomain] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-z0-9-]/g, '');
    setSubdomain(value);
    setInputError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (subdomain) onSignIn(subdomain);
      else setInputError('Please enter a subdomain');
    },
    [subdomain, onSignIn]
  );

  return (
    <Screen footer={null} ignoreConfig>
      <AuthHeader onBack={onBack} />
      <Container>
        <Stack>
          <div>
            <Icon />
            <Heading>Sign in with SSO</Heading>
            <Text muted>Enter your team&apos;s Chromatic URL.</Text>
          </div>
          <Form onSubmit={handleSubmit}>
            <SuffixInput
              autoFocus
              icon="users"
              value={subdomain}
              placeholder="yourteam"
              suffix=".chromatic.com"
              onChange={handleChange}
              id="subdomain-input"
              stackLevel="top"
              error={inputError}
              errorTooltipPlacement="top"
            />
            <SubmitButton type="submit" variant="solid" size="medium">
              Continue
            </SubmitButton>
          </Form>
        </Stack>
      </Container>
    </Screen>
  );
};
