import React from 'react';

import { BuildProgressInline } from '../../components/BuildProgressBarInline';
import { Button } from '../../components/Button';
import { ButtonStack } from '../../components/ButtonStack';
import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { LocalBuildProgress } from '../../types';
import { useTelemetry } from '../../utils/TelemetryContext';

const Intro = () => (
  <div>
    <Heading>Get started with visual testing</Heading>
    <Text center muted>
      Take an image snapshot of your stories to save their &quot;last known good state&quot; as test
      baselines.
    </Text>
  </div>
);

type InitialBuildProps = {
  isRunning: boolean;
  localBuildProgress?: LocalBuildProgress;
  startBuild: () => void;
  onSkip: () => void;
};

export const InitialBuild = ({
  isRunning,
  localBuildProgress,
  startBuild,
  onSkip,
}: InitialBuildProps) => {
  useTelemetry('Onboarding', 'InitialBuild');
  return (
    <Screen footer={null}>
      <Container>
        {localBuildProgress ? (
          <Stack>
            <Intro />
            <BuildProgressInline localBuildProgress={localBuildProgress} />
          </Stack>
        ) : (
          <Stack>
            <Intro />
            <ButtonStack>
              <Button
                ariaLabel={false}
                disabled={isRunning}
                size="medium"
                variant="solid"
                onClick={startBuild}
              >
                Take snapshots
              </Button>
              <Button ariaLabel={false} link onClick={onSkip}>
                Skip walkthrough
              </Button>
            </ButtonStack>
          </Stack>
        )}
      </Container>
    </Screen>
  );
};
