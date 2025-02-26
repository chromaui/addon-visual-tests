import { LockIcon } from '@storybook/icons';
import React from 'react';

import { Box, BoxTitle } from '../../components/Box';
import { Code } from '../../components/Code';
import { Container } from '../../components/Container';
import { Link } from '../../components/design-system';
import { Heading } from '../../components/Heading';
import { VisualTestsIcon } from '../../components/icons/VisualTestsIcon';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { useTelemetry } from '../../utils/TelemetryContext';
import { useUninstallAddon } from '../Uninstalled/UninstallContext';

export const GitNotFound = () => {
  useTelemetry('Errors', 'GitNotFound');
  const { uninstallAddon } = useUninstallAddon();
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <VisualTestsIcon />
            <Heading>Visual tests</Heading>
            <Text center muted>
              Catch bugs in UI appearance automatically. Compare image snapshots to detect visual
              changes.
            </Text>
          </div>
          <Box>
            <LockIcon style={{ flexShrink: 0 }} />
            <Text>
              <BoxTitle>Git not detected</BoxTitle>
              This addon requires Git to associate test results with commits and branches. Run{' '}
              <Code>git init</Code> and make your first commit
              <Code>git commit -m</Code> to get started!
            </Text>
          </Box>
          <Link
            target="_blank"
            href="https://www.chromatic.com/docs/visual-tests-addon#git-addon"
            withArrow
            secondary
          >
            Visual tests requirements
          </Link>

          <Link withArrow onClick={() => uninstallAddon()}>
            Uninstall
          </Link>
        </Stack>
      </Container>
    </Screen>
  );
};
