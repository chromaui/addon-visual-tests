import { styled } from "@storybook/theming";
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
}

export const CatchAChangeComplete = ({ onComplete }: CatchAChangeCompleteProps) => {
  useTelemetry("Onboarding", "CatchAChangeComplete");
  const selectedStory = useSelectedStoryState();
  return (
    <Screen footer={null}>
      <Container style={{ overflowY: "auto" }}>
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
          </ButtonStack>
        </Stack>
      </Container>
    </Screen>
  );
};
