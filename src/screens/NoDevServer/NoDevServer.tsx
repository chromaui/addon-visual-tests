import React from 'react';

import { Code } from '../../components/Code';
import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';

export const NoDevServer = () => {
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Visual tests</Heading>
            <Text center muted>
              Visual tests only runs locally. To test this Storybook, clone it to your machine and
              run <Code>npx storybook dev</Code>.
            </Text>
          </div>
        </Stack>
      </Container>
    </Screen>
  );
};
