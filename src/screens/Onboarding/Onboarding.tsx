import { Icons } from "@storybook/components";
import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React from "react";
import { gql } from "urql";

import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Row, Section } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { GitInfoPayload, LocalBuildProgress, SelectedBuildWithTests } from "../../types";

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

interface OnboardingProps {
  onCompleteOnboarding: () => void;
  skipWalkthrough: () => void;
  startDevBuild: () => void;
  selectedBuild?: SelectedBuildWithTests;
  localBuildProgress?: LocalBuildProgress;
  gitInfo: Pick<GitInfoPayload, "uncommittedHash" | "branch">;
}
export const Onboarding = ({
  startDevBuild,
  localBuildProgress,
  selectedBuild,
  gitInfo,
  onCompleteOnboarding,
  skipWalkthrough,
}: OnboardingProps) => {
  const showInitialBuild = !selectedBuild;
  const showCatchAChange = !!selectedBuild;
  const [initialGitHash, setInitialGitHash] = React.useState(gitInfo.uncommittedHash);

  const onCatchAChange = () => {
    console.log(
      "Do we need to do anything to switch screens? I guess there's initial entry, and then there's manual after?"
    );
    setInitialGitHash(gitInfo.uncommittedHash);
    // setShowCatchAChange(true);
  };

  const [runningSecondBuild, setRunningSecondBuild] = React.useState(false);

  React.useEffect(() => {
    console.log("Inside Onboarding component", {
      showCatchAChange,
      showInitialBuild,
      localBuildProgress,
      runningSecondBuild,
      selectedBuild,
    });
  }, [
    localBuildProgress,
    runningSecondBuild,
    showCatchAChange,
    showInitialBuild,
    selectedBuild?.id,
  ]);

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
          <Button link onClick={skipWalkthrough}>
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

  // This doesn't work now that showCatchAChange isn't a state variable
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
            <Heading>Nice. You saved your stories as a test baseline.</Heading>
            <Text>This story was indexed and snapshotted in a standardized cloud browser.</Text>
            <img src="/Snapshot-Preview.png" alt="Snapshot Preview" />
            <Text>Let’s see the superpower of catching visual changes.</Text>
            <Button small secondary onClick={onCatchAChange}>
              Catch a UI change
            </Button>
          </div>
          <Button link onClick={skipWalkthrough}>
            Skip walkthrough
          </Button>
        </Stack>
      </Container>
    );
  }

  if (showCatchAChange && initialGitHash === gitInfo.uncommittedHash) {
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Make a change to this story</Heading>
            <Text>
              In your code, adjust the markup, styling, or assets to see how visual testing works.
              Don’t worry, you can undo it later. Here are a few ideas to get you started.
            </Text>
          </div>
          {/* TODO: Fix the alignment of these */}
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
          <Button link onClick={skipWalkthrough}>
            Skip walkthrough
          </Button>
          <Button link onClick={skipWalkthrough}>
            Skip walkthrough
          </Button>
        </Stack>
      </Container>
    );
  }

  // If the first build is done, changes were detected, and the second build hasn't started yet.
  if (showCatchAChange && initialGitHash !== gitInfo.uncommittedHash && !runningSecondBuild) {
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Changes detected</Heading>
            <Text>
              Time to run your first visual test! Visual tests will pinpoint the exact changes made
              to this Story.
            </Text>
          </div>
          <Button
            small
            secondary
            onClick={() => {
              setRunningSecondBuild(true);
              startDevBuild();
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
    runningSecondBuild &&
    localBuildProgress.currentStep !== "error" &&
    localBuildProgress.currentStep !== "complete"
  ) {
    return (
      <Container>
        <Stack>
          <div>
            <Heading>Changes detected</Heading>
            <Text>
              Time to run your first visual test! Visual tests will pinpoint the exact changes made
              to this Story
            </Text>
          </div>
          <BuildProgressInline localBuildProgress={localBuildProgress} />
        </Stack>
      </Container>
    );
  }

  // If the second build has been run and is complete, show the results
  // TODO: Hmmm this is the same UI as the first build, but if user has already onboarded. Maybe these first steps are just not a part of onboarding?
  if (localBuildProgress && localBuildProgress.currentStep === "complete" && runningSecondBuild) {
    return (
      <Container style={{ overflowY: "auto" }}>
        <Stack>
          <div>
            <Heading>Nice. You saved your stories as a test baseline.</Heading>
            <Text>This story was indexed and snapshotted in a standardized cloud browser.</Text>
            <img
              style={{ maxWidth: "100%" }}
              src="/example-button-noargs.png"
              alt="Start build button noargs"
            />
          </div>
        </Stack>
        <Text>You're ready to start testing!</Text>
        <Button small secondary onClick={onCompleteOnboarding}>
          Done!
        </Button>
      </Container>
    );
  }
  // And then, somehow, we need to enter into the popup guided tour with "Changes found!" pointing to real changes.
  // What if there are no changes in the latest build? Do we just assume that there are? Do we need to show the onboarding multiple times? At least until there are changes?

  // TODO: We shouldn't need a default case like this
  return (
    <Container>
      No Screen Selected
      <br />
      <br />
      <span>
        {JSON.stringify({
          localBuildProgress,
          showCatchAChange,
          showInitialBuild,
          runningSecondBuild,
          hasSelectedBuild: !!selectedBuild,
        })}
      </span>
    </Container>
  );
};
