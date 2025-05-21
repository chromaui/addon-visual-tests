import React from 'react';

import { Box, BoxList } from '../../components/Box';
import { Code } from '../../components/Code';
import { Container } from '../../components/Container';
import { Link } from '../../components/design-system';
import { Heading } from '../../components/Heading';
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
            <Heading>Setup a Git repository</Heading>
            <Text center muted>
              Chromatic requires Git to associate test results with commits and branches.
            </Text>
          </div>
          <Box>
            <Text>
              Run these steps to get started:
              <BoxList>
                <li>
                  <Code>git init</Code>
                </li>
                <li>
                  <Code>git add .</Code>
                </li>
                <li>
                  <Code>git commit -m "Initial commit"</Code>
                </li>
              </BoxList>
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
