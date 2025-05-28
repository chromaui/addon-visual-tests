import React from 'react';

import { Container } from '../../components/Container';
import { Link } from '../../components/design-system';
import { Heading } from '../../components/Heading';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';

export const NoNetwork = ({ offline = false }: { offline?: boolean }) => {
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Can't connect to Chromatic</Heading>
            <Text center muted>
              {offline
                ? "You're offline. Double check your internet connection."
                : "We're having trouble connecting to the Chromatic API."}
            </Text>
          </div>

          {!offline && (
            <Link href="https://status.chromatic.com" target="_blank" rel="noreferrer" withArrow>
              Chromatic API status
            </Link>
          )}
        </Stack>
      </Container>
    </Screen>
  );
};
