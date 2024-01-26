import { Icons } from "@storybook/components";
import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React, { useEffect, useState } from "react";
import { gql } from "urql";

import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
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
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.appBorderRadius,
  padding: "6px 10px",
  lineHeight: "18px",
}));

const Warning = styled.div(({ theme }) => ({
  background: theme.background.warning,
  padding: "10px",
  lineHeight: "18px",
  position: "relative",
  margin: "0 27px",
}));

const WarningText = styled(Text)(({ theme }) => ({
  color: theme.color.darkest,
}));

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  startDevBuild: () => void;
  selectedBuild?: SelectedBuildFieldsFragment | null;
  lastBuildHasChanges?: boolean;
  localBuildProgress?: LocalBuildProgress;
  showInitialBuildScreen?: boolean;
  gitInfo: Pick<GitInfoPayload, "uncommittedHash" | "branch">;
}
export const Onboarding = ({
  startDevBuild,
  localBuildProgress,
  showInitialBuildScreen,
  gitInfo,
  onComplete,
  onSkip,
  lastBuildHasChanges,
}: OnboardingProps) => {
  const { selectedBuild } = useBuildState();
  const selectedStory = useSelectedStoryState();
  // The initial build screen is only necessary if this is a brand new project with no builds at all. Instead, !selectedBuild would appear on any new branch, even if there are other builds on the project.
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

  React.useEffect(() => {
    console.log("State", {
      runningFirstBuild: !!localBuildProgress,
      runningSecondBuild,
      showCatchAChange,
      showInitialBuild,
      selectedStory,
      selectedBuild,
      gitInfo,
    });
  }, [runningSecondBuild, showCatchAChange, showInitialBuild]);
  // TODO: This design for an error in the Onboarding is incomplete
  if (localBuildProgress && localBuildProgress.currentStep === "error") {
    return (
      <Container>
        <Stack>
          <h1>Something went wrong</h1>
          <p>
            {Array.isArray(localBuildProgress.originalError)
              ? localBuildProgress.originalError[0]?.message
              : localBuildProgress.originalError?.message}
          </p>
          <Button small secondary onClick={startDevBuild}>
            Try again
          </Button>
          <Button link onClick={onSkip}>
            Skip walkthrough
          </Button>
        </Stack>
      </Container>
    );
  }

  // TODO: After running a first build, this screen should show the showCatchAChange screen. But if the user restarts Storybook, it comes back to this screen.
  // Oddly, this seems to be because project.lastBuild is undefined in GraphQL, so at least it doesn't skip out of the onboarding flow.
  // But we'll need some check to see if one build was run to prompt them to make a change and run another
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
          <Button small secondary onClick={startDevBuild}>
            Take snapshots
          </Button>
          <Button onClick={onSkip} link>
            Skip walkthrough
          </Button>
        </Stack>
      </Container>
    );
  }

  if (
    showInitialBuild &&
    localBuildProgress &&
    localBuildProgress.currentStep !== "error" &&
    localBuildProgress.currentStep !== "complete"
  ) {
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
    !showCatchAChange
    // && !runningSecondBuild
  ) {
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Nice. You saved your stories as a test baseline.</Heading>
            <Text>This story was indexed and snapshotted in a standardized cloud browser.</Text>
            {/* TODO: selectedComparison is undefined if this is the very first build.  */}
            {selectedStory?.selectedComparison?.headCapture?.captureImage && (
              <SnapshotImageThumb
                {...selectedStory?.selectedComparison?.headCapture.captureImage}
                status="positive"
              />
            )}
            <Text>Let’s see the superpower of catching visual changes.</Text>
            <Button small secondary onClick={onCatchAChange}>
              Catch a UI change
            </Button>
          </div>
          <Button link onClick={onSkip}>
            Skip walkthrough
          </Button>
        </Stack>
      </Container>
    );
  }

  if (
    showCatchAChange &&
    initialGitHash === gitInfo.uncommittedHash &&
    !lastBuildHasChanges &&
    // If there are no changes, let the user rerun the build.
    (!localBuildProgress ||
      localBuildProgress.currentStep === "error" ||
      localBuildProgress.currentStep === "complete")
  ) {
    // Log useful for debugging, but do not display broken screen to users in odd edge cases
    // eslint-disable-next-line no-console
    console.log("Onboarding: Make a change", {
      state: {
        runningSecondBuild,
        showCatchAChange,
        lastBuildHasChanges,
        localBuildProgress,
        selectedStory,
        selectedBuild,
        gitInfo,
      },
    });
    return (
      // Hack to make the layout cover content that overflows the container, and still fill the entire addon tab.
      <Container style={{ minHeight: "unset", flex: 1 }}>
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
          <Stack style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <Row style={{ margin: 0, alignItems: "center", gap: "10px" }}>
              <img
                src="/onboarding-color-palette.png"
                alt="Color Palette"
                style={{ width: 32, height: 32 }}
              />
              Shift the color palette
            </Row>
            <Row style={{ margin: 0, alignItems: "center", gap: "10px" }}>
              <img
                src="/onboarding-embiggen.png"
                alt="Embiggen"
                style={{ width: 32, height: 32 }}
              />{" "}
              Embiggen the type
            </Row>
            <Row style={{ margin: 0, alignItems: "center", gap: "10px" }}>
              <img
                src="/onboarding-color-palette.png"
                alt="Color Palette"
                style={{ width: 32, height: 32 }}
              />
              Change the layout
            </Row>
            <Row style={{ margin: 0, alignItems: "center", gap: "10px" }}>
              <img
                src="/onboarding-adjust-size.png"
                style={{ width: 32, height: 32 }}
                alt="Color Palette"
              />
              <p>Adjust the size or scale</p>
            </Row>
          </Stack>
          <Box>Awaiting changes...</Box>
          <Button link onClick={onSkip}>
            Skip walkthrough
          </Button>
        </Stack>
      </Container>
    );
  }

  // If the first build is done, changes were detected, and the second build hasn't started yet.
  if (
    showCatchAChange &&
    initialGitHash !== gitInfo.uncommittedHash &&
    (!localBuildProgress ||
      localBuildProgress.currentStep === "error" ||
      localBuildProgress.currentStep === "complete")
  ) {
    console.log("Onboarding: Changes Detected, Second Build Not Started", {
      state: {
        runningSecondBuild,
        showCatchAChange,
        lastBuildHasChanges,
        localBuildProgress,
        selectedStory,
        selectedBuild,
        gitInfo,
      },
    });
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Changes detected</Heading>
            <Text>
              Time to run your first visual test! Visual tests will pinpoint the exact changes made
              to this story.
            </Text>
          </div>
          <Button
            small
            secondary
            onClick={() => {
              setRunningSecondBuild(true);
              startDevBuild();
              // In case the build doe not have changes, reset gitHash to the current value
              setInitialGitHash(gitInfo.uncommittedHash);
            }}
          >
            <Icons icon="play" />
            Run visual tests
          </Button>
        </Stack>
      </Container>
    );
  }

  // If the first build is done, changes were detected, and the second build is in progress.
  if (
    localBuildProgress &&
    showCatchAChange &&
    localBuildProgress.currentStep !== "error" &&
    localBuildProgress.currentStep !== "complete" &&
    !lastBuildHasChanges
  ) {
    // Log useful for debugging, but do not display broken screen to users in odd edge cases
    // eslint-disable-next-line no-console
    console.log("Onboarding: Changes detected, build in progress", {
      state: {
        runningSecondBuild,
        showCatchAChange,
        lastBuildHasChanges,
        localBuildProgress,
        selectedStory,
        selectedBuild,
        gitInfo,
      },
    });
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Changes detected</Heading>
            <Text>
              Time to run your first visual test! Visual tests will pinpoint the exact changes made
              to this story.
            </Text>
          </div>
          <BuildProgressInline localBuildProgress={localBuildProgress} />
        </Stack>
      </Container>
    );
  }

  // If the second build has been run and is complete, show the results
  if (
    (localBuildProgress && localBuildProgress.currentStep === "complete") ||
    lastBuildHasChanges
  ) {
    console.log("Onboarding: Build completed with changes", {
      state: {
        runningSecondBuild,
        showCatchAChange,
        lastBuildHasChanges,
        localBuildProgress,
        selectedStory,
        selectedBuild,
        gitInfo,
      },
    });
    return (
      <Container style={{ overflowY: "auto" }}>
        <Stack>
          <div>
            <Heading>Nice. You saved your stories as a test baseline.</Heading>
            <Text>This story was indexed and snapshotted in a standardized cloud browser.</Text>
            {selectedStory.selectedComparison?.headCapture?.captureImage && (
              <SnapshotImageThumb
                {...selectedStory.selectedComparison?.headCapture?.captureImage}
                status="positive"
              />
            )}
          </div>
        </Stack>
        <Text>You're ready to start testing!</Text>
        <Button small secondary onClick={onComplete}>
          Done!
        </Button>
      </Container>
    );
  }

  // Log useful for debugging, but do not display broken screen to users in odd edge cases
  // eslint-disable-next-line no-console
  console.log("Onboarding: No screen selected", {
    state: {
      runningSecondBuild,
      showCatchAChange,
      lastBuildHasChanges,
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
