import { styled } from "storybook/internal/theming";
import React from "react";

import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { SnapshotImageThumb } from "../../components/SnapshotImageThumb";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { useTelemetry } from "../../utils/TelemetryContext";
import { useSelectedStoryState } from "../VisualTests/BuildContext";

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
  useTelemetry("Onboarding", "CatchAChangeComplete");
  const selectedStory = useSelectedStoryState();
  return (
    <Screen footer={null}>
      <Container style={{ overflowY: "auto" }}>
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
              <Button variant="solid" size="medium" onClick={onComplete}>
                Done
              </Button>
              <Button link onClick={onSkip}>
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
              <Button variant="solid" size="medium" onClick={onComplete}>
                Take a tour
              </Button>
              <Button link onClick={onSkip}>
                Skip walkthrough
              </Button>
            </ButtonStack>
          </Stack>
        )}
      </Container>
    </Screen>
  );
};
