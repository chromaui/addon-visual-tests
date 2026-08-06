import React from 'react';

import { Code } from '../../components/Code';
import { Container } from '../../components/Container';
import { Link } from '../../components/design-system';
import { Heading } from '../../components/Heading';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { isProjectTokenAsProjectId } from '../../utils/isValidProjectId';
import { useTelemetry } from '../../utils/TelemetryContext';

const configureDocsLink =
  'https://www.chromatic.com/docs/visual-tests-addon#addon-configuration-options';

export function InvalidProjectId({
  projectId,
  configFile,
}: {
  projectId: string;
  configFile?: string;
}) {
  const isToken = isProjectTokenAsProjectId(projectId);
  useTelemetry('Errors', isToken ? 'ProjectTokenAsProjectId' : 'InvalidProjectId');

  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>{isToken ? 'Project token used as projectId' : 'Invalid projectId'}</Heading>
            <Text center muted>
              {isToken ? (
                <>
                  Your config has a <Code>projectToken</Code> value in the <Code>projectId</Code>{' '}
                  field. Replace it with your project ID (e.g.{' '}
                  <Code>Project:6a5f380ff722e99891c38497</Code>).
                </>
              ) : (
                <>
                  The <Code>projectId</Code> in your Chromatic config is invalid. Expected{' '}
                  <Code>Project:</Code> followed by a 24-character hex id.
                </>
              )}
            </Text>
          </div>
          <Text center muted>
            Current value: <Code>{projectId}</Code>
            {configFile ? (
              <>
                {' '}
                in <Code>{configFile}</Code>
              </>
            ) : null}
          </Text>
          <Link secondary withArrow target="_blank" href={configureDocsLink}>
            Configuration docs
          </Link>
        </Stack>
      </Container>
    </Screen>
  );
}
