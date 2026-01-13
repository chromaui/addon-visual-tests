import React from 'react';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';
import { ButtonStack } from '../../components/ButtonStack';
import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { Screen } from '../../components/Screen';
import { SnapshotImageThumb } from '../../components/SnapshotImageThumb';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { useTelemetry } from '../../utils/TelemetryContext';
import { useSelectedStoryState } from '../VisualTests/BuildContext';

const ButtonStackText = styled(Text)({ marginBottom: 5 });

type InitialBuildCompleteProps = {
  onCatchAChange: () => void;
  onSkip: () => void;
};

export const InitialBuildComplete = ({ onCatchAChange, onSkip }: InitialBuildCompleteProps) => {
  useTelemetry('Onboarding', 'InitialBuildComplete');
  const selectedStory = useSelectedStoryState();
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Nice. Your stories were saved as test baselines.</Heading>
            <Text center muted block>
              This story was indexed and snapshotted in a standardized cloud browser.
            </Text>
            {selectedStory?.selectedComparison?.headCapture?.captureImage && (
              <SnapshotImageThumb
                {...selectedStory?.selectedComparison?.headCapture.captureImage}
                status="positive"
              />
            )}
          </div>
          <ButtonStack>
            <ButtonStackText muted>
              Let&apos;s see the superpower of catching visual changes.
            </ButtonStackText>
            <Button ariaLabel={false} variant="solid" size="medium" onClick={onCatchAChange}>
              Catch a UI change
            </Button>
            <Button ariaLabel={false} link onClick={onSkip}>
              Skip walkthrough
            </Button>
          </ButtonStack>
        </Stack>
      </Container>
    </Screen>
  );
};
