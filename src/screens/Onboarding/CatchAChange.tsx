import { PlayIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import { lighten } from "polished";
import React from "react";

import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Row } from "../../components/layout";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { useTelemetry } from "../../utils/TelemetryContext";
import onboardingAdjustSizeImage from "./onboarding-adjust-size.png";
import onboardingColorPaletteImage from "./onboarding-color-palette.png";
import onboardingEmbiggenImage from "./onboarding-embiggen.png";
import onboardingLayoutImage from "./onboarding-layout.png";

const Box = styled.div(({ theme }) => ({
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,
  padding: "6px 10px",
  fontSize: 13,
  lineHeight: "18px",
}));

const Warning = styled.div(({ theme }) => ({
  lineHeight: "18px",
  position: "relative",
  borderRadius: 5,
  display: "block",
  minWidth: "80%",
  color: theme.color.warningText,
  background: theme.background.warning,
  border: `1px solid ${lighten(0.5, theme.color.warningText)}`,
  padding: 15,
  margin: 0,
}));

const WarningText = styled(Text)(({ theme }) => ({
  color: theme.color.darkest,
}));

interface MakeAChangeProps {
  onSkip: () => void;
  runningSecondBuild: boolean;
}

const MakeAChange = ({ onSkip, runningSecondBuild }: MakeAChangeProps) => (
  <Screen footer={null}>
    <Container>
      <Stack>
        <div>
          <Heading>Make a change to this story</Heading>
          <Text center muted block>
            In your code, adjust the markup, styling, or assets to see how visual testing works.
            Don’t worry, you can undo it later. Here are a few ideas to get you started.
          </Text>
        </div>
        <Stack style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "10px 0" }}>
          <Row style={{ margin: 0, alignItems: "center", gap: "10px" }}>
            <img
              src={onboardingColorPaletteImage}
              alt="Color Palette"
              style={{ width: 32, height: 32 }}
            />
            Shift the color palette
          </Row>
          <Row style={{ margin: 0, alignItems: "center", gap: "10px" }}>
            <img src={onboardingEmbiggenImage} alt="Embiggen" style={{ width: 32, height: 32 }} />{" "}
            Embiggen the type
          </Row>
          <Row style={{ margin: 0, alignItems: "center", gap: "10px" }}>
            <img src={onboardingLayoutImage} alt="Layout" style={{ width: 32, height: 32 }} />
            Change the layout
          </Row>
          <Row style={{ margin: 0, alignItems: "center", gap: "10px" }}>
            <img src={onboardingAdjustSizeImage} alt="Adjust" style={{ width: 32, height: 32 }} />
            Adjust the size or scale
          </Row>
        </Stack>
        <ButtonStack>
          {runningSecondBuild ? (
            <Warning>
              <WarningText>
                No changes found in the Storybook you published. Make a UI tweak and try again to
                continue.
              </WarningText>
            </Warning>
          ) : (
            <Box>Awaiting changes...</Box>
          )}

          <Button link onClick={onSkip}>
            Skip walkthrough
          </Button>
        </ButtonStack>
      </Stack>
    </Container>
  </Screen>
);

interface ChangesDetectedProps {
  setRunningSecondBuild: (value: boolean) => void;
  startBuild: () => void;
  setInitialGitHash: (value: string) => void;
  uncommittedHash: string;
}

const ChangesDetected = ({
  setRunningSecondBuild,
  startBuild,
  setInitialGitHash,
  uncommittedHash,
}: ChangesDetectedProps) => {
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Changes detected</Heading>
            <Text center muted>
              Time to run your first visual tests to pinpoint the exact changes made to this story.
            </Text>
          </div>
          <Button
            variant="solid"
            size="medium"
            onClick={() => {
              setRunningSecondBuild(true);
              startBuild();
              // In case the build does not have changes, reset gitHash to the current value to show Make A Change again.
              // A timeout is used to prevent "Make a Change" from reappearing briefly before the build starts.
              setTimeout(() => {
                setInitialGitHash(uncommittedHash);
              }, 10000);
            }}
          >
            <PlayIcon />
            Run visual tests
          </Button>
        </Stack>
      </Container>
    </Screen>
  );
};

interface RunningTestsProps {
  localBuildProgress?: any;
}

const RunningTests = ({ localBuildProgress }: RunningTestsProps) => (
  <Screen footer={null}>
    <Container>
      <Stack>
        <div>
          <Heading>Running your first test</Heading>
          <Text center muted>
            A new snapshot is being created in a standardized cloud browser. Once complete,
            you&apos;ll be able to pinpoint exactly what changed.
          </Text>
        </div>
        <BuildProgressInline localBuildProgress={localBuildProgress} />
      </Stack>
    </Container>
  </Screen>
);

interface CatchAChangeProps {
  isRunning: boolean;
  isUnchanged: boolean;
}

export const CatchAChange = (
  props: CatchAChangeProps & MakeAChangeProps & ChangesDetectedProps & RunningTestsProps
) => {
  useTelemetry("Onboarding", "CatchAChange");
  const { isRunning, isUnchanged } = props;
  if (isRunning) return <RunningTests {...props} />;
  return isUnchanged ? <MakeAChange {...props} /> : <ChangesDetected {...props} />;
};
