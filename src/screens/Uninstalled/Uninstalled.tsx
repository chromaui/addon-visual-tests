import React from 'react';

import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { VisualTestsIcon } from '../../components/icons/VisualTestsIcon';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { useTelemetry } from '../../utils/TelemetryContext';

export const Uninstalled = () => {
  useTelemetry('Uninstalled', 'uninstalled');
  return (
    <Screen footer={false}>
      <Container>
        <Stack>
          <div>
            <VisualTestsIcon />
            <Heading>Uninstall complete</Heading>
            <Text center muted>
              Visual tests will vanish the next time you restart your Storybook.
            </Text>
          </div>
        </Stack>
      </Container>
    </Screen>
  );
};
