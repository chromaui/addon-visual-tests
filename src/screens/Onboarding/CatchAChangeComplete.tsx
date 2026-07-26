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

interface CatchAChangeCompleteProps {
  onComplete: () => void;
  onSkip: () => void;
  ranSecondBuild?: boolean;
}

export const CatchAChangeComplete = ({
  onComplete,
  onSkip,
  ranSecondBuild = false,
}: CatchAChangeCompleteProps) => {
  const trackEvent = useTelemetry('Onboarding', 'CatchAChangeComplete');
  const handleComplete = () => {
    // Both routes land on this screen, so `screen` alone can't tell them apart.
    trackEvent('completeOnboarding', { path: ranSecondBuild ? 'secondBuild' : 'firstBuild' });
    onComplete();
  };
  const handleSkip = () => {
    trackEvent('skipOnboarding');
    onSkip();
  };
  const selectedStory = useSelectedStoryState();
  return (
    <Screen footer={null}>
      <Container style={{ overflowY: 'auto' }}>
        {ranSecondBuild ? (
          <Stack>
            <div>
              <Heading>Nice. Your stories were saved as test baselines.</Heading>
              <Text center muted block>
                This story was indexed and snapshotted in a standardized cloud browser.
              </Text>
              {selectedStory.selectedComparison?.headCapture?.captureImage && (
                <SnapshotImageThumb
                  {...selectedStory.selectedComparison?.headCapture?.captureImage}
                  status="positive"
                />
              )}
            </div>
            <ButtonStack>
              <ButtonStackText>You&apos;re ready to start testing!</ButtonStackText>
              <Button ariaLabel={false} variant="solid" size="medium" onClick={handleComplete}>
                Done
              </Button>
              <Button ariaLabel={false} link onClick={handleSkip}>
                Skip walkthrough
              </Button>
            </ButtonStack>
          </Stack>
        ) : (
          <Stack>
            <div>
              <Heading>Nice. You ran your first tests!</Heading>
              <Text center muted block>
                This story was indexed and snapshotted in a standardized cloud browser and changes
                were found.
              </Text>
              {selectedStory.selectedComparison?.headCapture?.captureImage && (
                <SnapshotImageThumb
                  {...selectedStory.selectedComparison?.headCapture?.captureImage}
                  status="positive"
                />
              )}
            </div>
            <ButtonStack>
              <ButtonStackText>It's time to review changes!</ButtonStackText>
              <Button ariaLabel={false} variant="solid" size="medium" onClick={handleComplete}>
                Take a tour
              </Button>
              <Button ariaLabel={false} link onClick={handleSkip}>
                Skip walkthrough
              </Button>
            </ButtonStack>
          </Stack>
        )}
      </Container>
    </Screen>
  );
};
