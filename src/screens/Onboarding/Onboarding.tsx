import { PlayIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import { lighten } from "polished";
import React, { useEffect, useState } from "react";
import { gql } from "urql";

import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Row, Section } from "../../components/layout";
import { SnapshotImageThumb } from "../../components/SnapshotImageThumb";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { SelectedBuildFieldsFragment } from "../../gql/graphql";
import { GitInfoPayload, LocalBuildProgress, SelectedBuildWithTests } from "../../types";
import {
  useBuildState,
  useSelectedBuildState,
  useSelectedStoryState,
} from "../VisualTests/BuildContext";
import onboardingAdjustSizeImage from "./onboarding-adjust-size.png";
import onboardingColorPaletteImage from "./onboarding-color-palette.png";
import onboardingEmbiggenImage from "./onboarding-embiggen.png";
import onboardingLayoutImage from "./onboarding-layout.png";

const ProjectQuery = gql`
  query ProjectQuery($projectId: ID!) {
    project(id: $projectId) {
      id
      name
      webUrl
      lastBuild {
        branch
        number
      }
    }
  }
`;

const Box = styled.div(({ theme }) => ({
  border: `1px solid ${theme.base === "light" ? theme.color.border : theme.color.darker}`,
  borderRadius: theme.appBorderRadius,
  padding: "6px 10px",
  lineHeight: "18px",
}));

const Warning = styled.div(({ theme }) => ({
  background: theme.background.warning,
  padding: 10,
  lineHeight: "18px",
  position: "relative",
  margin: "0 27px",
}));

const WarningText = styled(Text)(({ theme }) => ({
  color: theme.color.darkest,
}));

const ButtonStackText = styled(Text)(() => ({
  marginBottom: 5,
}));

const ErrorContainer = styled.pre(({ theme }) => ({
  display: "block",
  minWidth: "80%",
  color: theme.color.warningText,
  background: theme.background.warning,
  border: `1px solid ${lighten(0.5, theme.color.warningText)}`,
  borderRadius: 2,
  padding: 15,
  margin: 0,
  fontSize: theme.typography.size.s1,
  textAlign: "left",
}));

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  startDevBuild: () => void;
  selectedBuild?: SelectedBuildFieldsFragment | null;
  localBuildProgress?: LocalBuildProgress;
  showInitialBuildScreen?: boolean;
  lastBuildHasChanges: boolean;
  gitInfo: Pick<GitInfoPayload, "uncommittedHash" | "branch">;
}
export const Onboarding = ({
  startDevBuild,
  localBuildProgress,
  showInitialBuildScreen,
  gitInfo,
  lastBuildHasChanges,
  onComplete,
  onSkip,
}: OnboardingProps) => {
  const { selectedBuild } = useBuildState();
  const selectedStory = useSelectedStoryState();

  // The initial build screen is only necessary if this is a brand new project with no builds at all. Instead, !selectedBuild would appear on any new branch, even if there are other builds on the project.
  // TODO: Removed this entirely to solve for the most common case of an existing user with some builds to use as a baseline.
  // Removing instead of fixing to avoid additional work as this project is past due. We need to revisit this later.
  const [showInitialBuild, setShowInitialBuild] = useState(showInitialBuildScreen);
  useEffect(() => {
    // Watch the value of showInitialBuildScreen, and if it becomes true, set the state to true. This is necessary because Onboarding may render before there is data to determine if there are any builds.
    if (showInitialBuildScreen) {
      setShowInitialBuild(true);
    }
  }, [showInitialBuildScreen]);

  const [showCatchAChange, setShowCatchAChange] = useState(() => !showInitialBuild);
  const [initialGitHash, setInitialGitHash] = React.useState(gitInfo.uncommittedHash);

  const onCatchAChange = () => {
    setInitialGitHash(gitInfo.uncommittedHash);
    setShowCatchAChange(true);
  };

  const [runningSecondBuild, setRunningSecondBuild] = React.useState(false);

  const localBuildIsRunning =
    localBuildProgress &&
    localBuildProgress.currentStep !== "complete" &&
    localBuildProgress.currentStep !== "error" &&
    localBuildProgress.currentStep !== "aborted";

  // TODO: This design for an error in the Onboarding is incomplete
  if (localBuildProgress && localBuildProgress.currentStep === "error") {
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Something went wrong</Heading>
            <Text>Your tests will sync with this project.</Text>
          </div>
          <ErrorContainer>
            {Array.isArray(localBuildProgress.originalError)
              ? localBuildProgress.originalError[0]?.message
              : localBuildProgress.originalError?.message}
          </ErrorContainer>
          <ButtonStack>
            <Button variant="solid" size="medium" onClick={startDevBuild}>
              Try again
            </Button>
            <Button link onClick={onSkip}>
              Skip walkthrough
            </Button>
          </ButtonStack>
        </Stack>
      </Container>
    );
  }
  if (showInitialBuild && !localBuildProgress) {
    return (
      <Container>
        <Stack>
          <div>
            <VisualTestsIcon />
            <Heading>Get started with visual testing</Heading>
            <Text>
              Take an image snapshot of each story to save their “last known good state” as test
              baselines.{" "}
            </Text>
          </div>
          <ButtonStack>
            <Button size="medium" variant="solid" onClick={startDevBuild}>
              Take snapshots
            </Button>
            <Button onClick={onSkip} link>
              Skip walkthrough
            </Button>
          </ButtonStack>
        </Stack>
      </Container>
    );
  }

  if (showInitialBuild && localBuildProgress && localBuildIsRunning) {
    // When the build is in progress, show the build progress bar
    return (
      <Container>
        <Stack>
          <div>
            <VisualTestsIcon />
            <Heading>Get started with visual testing</Heading>
            <Text>
              Take an image snapshot of each story to save their “last known good state” as test
              baselines.
            </Text>
          </div>
          <BuildProgressInline localBuildProgress={localBuildProgress} />
        </Stack>
      </Container>
    );
  }

  if (
    localBuildProgress &&
    localBuildProgress.currentStep === "complete" &&
    !showCatchAChange &&
    !runningSecondBuild
  ) {
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Nice. Your stories were saved as test baselines.</Heading>
            <Text>This story was indexed and snapshotted in a standardized cloud browser.</Text>
            {selectedStory?.selectedComparison?.headCapture?.captureImage && (
              <SnapshotImageThumb
                {...selectedStory?.selectedComparison?.headCapture.captureImage}
                status="positive"
              />
            )}
          </div>
          <ButtonStack>
            <ButtonStackText>Let’s see the superpower of catching visual changes.</ButtonStackText>
            <Button variant="solid" size="medium" onClick={onCatchAChange}>
              Catch a UI change
            </Button>
            <Button link onClick={onSkip}>
              Skip walkthrough
            </Button>
          </ButtonStack>
        </Stack>
      </Container>
    );
  }

  if (
    showCatchAChange &&
    initialGitHash === gitInfo.uncommittedHash &&
    !localBuildIsRunning &&
    !lastBuildHasChanges
  ) {
    return (
      <Container>
        <Stack>
          {!lastBuildHasChanges && runningSecondBuild && (
            <Warning>
              <WarningText>
                No changes found in the Storybook you published. Make a UI tweak and publish again
                to continue.
              </WarningText>
            </Warning>
          )}
          <div>
            <Heading>Make a change to this story</Heading>
            <Text>
              In your code, adjust the markup, styling, or assets to see how visual testing works.
              Don’t worry, you can undo it later. Here are a few ideas to get you started.
            </Text>
          </div>
          <Stack
            style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "10px 0" }}
          >
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
            <Box>Awaiting changes...</Box>
            <Button link onClick={onSkip}>
              Skip walkthrough
            </Button>
          </ButtonStack>
        </Stack>
      </Container>
    );
  }

  // If the first build is done, changes were detected, and the second build hasn't started yet.
  if (
    showCatchAChange &&
    initialGitHash !== gitInfo.uncommittedHash &&
    !localBuildIsRunning &&
    !lastBuildHasChanges
  ) {
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Changes detected</Heading>
            <Text>
              Time to run your first visual tests to pinpoint the exact changes made to this story.
            </Text>
          </div>
          <Button
            variant="solid"
            size="medium"
            onClick={() => {
              setRunningSecondBuild(true);
              startDevBuild();
              // In case the build does not have changes, reset gitHash to the current value to show Make A Change again. Timeout 1s to prevent Make a Change reappearing briefly before build starts.
              setTimeout(() => {
                setInitialGitHash(gitInfo.uncommittedHash);
              }, 1000);
            }}
          >
            <PlayIcon />
            Run visual tests
          </Button>
        </Stack>
      </Container>
    );
  }

  // If the first build is done, changes were detected, and the second build is in progress.
  if (localBuildProgress && showCatchAChange && localBuildIsRunning) {
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Changes detected</Heading>
            <Text>
              Time to run your first visual tests to pinpoint the exact changes made to this story.
            </Text>
          </div>
          <BuildProgressInline localBuildProgress={localBuildProgress} />
        </Stack>
      </Container>
    );
  }

  // If the last build has changes, show the "Done" screen
  if (!localBuildIsRunning && lastBuildHasChanges) {
    return (
      <Container style={{ overflowY: "auto" }}>
        <Stack>
          <div>
            <Heading>Nice. Your stories were saved as test baselines.</Heading>
            <Text>This story was indexed and snapshotted in a standardized cloud browser.</Text>
            {selectedStory.selectedComparison?.headCapture?.captureImage && (
              <SnapshotImageThumb
                {...selectedStory.selectedComparison?.headCapture?.captureImage}
                status="positive"
              />
            )}
          </div>
          <ButtonStack>
            <ButtonStackText>You&rsquo;re ready to start testing!</ButtonStackText>
            <Button variant="solid" size="medium" onClick={onComplete}>
              Done
            </Button>
          </ButtonStack>
        </Stack>
      </Container>
    );
  }

  // Log useful for debugging, but do not display broken screen to users in odd edge cases
  // eslint-disable-next-line no-console
  console.info("No screen selected", {
    state: {
      runningSecondBuild,
      showCatchAChange,
      localBuildProgress,
      selectedStory,
      selectedBuild,
      gitInfo,
    },
  });
  return (
    <Container>
      <></>
    </Container>
  );
};
