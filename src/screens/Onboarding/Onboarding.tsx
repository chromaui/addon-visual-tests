import { Icons } from "@storybook/components";
import { Icon } from "@storybook/design-system";
import React from "react";
import { CombinedError, gql, useQuery } from "urql";

import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { GitInfoPayload, LocalBuildProgress } from "../../types";

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

interface NoBuildProps {
  // queryError?: CombinedError;
  // hasData: boolean;
  // hasSelectedBuild: boolean;
  startDevBuild: () => void;
  localBuildProgress?: LocalBuildProgress;
  gitInfo: Pick<GitInfoPayload, "uncommittedHash" | "branch">;
}

type OnboardingScreen = "onboarding" | "catchAChange" | "changesDetected";

export const Onboarding = ({ startDevBuild, localBuildProgress, gitInfo }: NoBuildProps) => {
  const screen = React.useState<OnboardingScreen>();

  const [catchAChange, setCatchAChange] = React.useState(false);
  const [initialGitHash, setInitialGitHash] = React.useState("");
  const onCatchAChange = () => {
    setInitialGitHash(gitInfo.uncommittedHash);
    setCatchAChange(true);
  };
  const [runningSecondBuild, setRunningSecondBuild] = React.useState(false);

  // TODO: Add stories and logic for error handling
  if (localBuildProgress && localBuildProgress.currentStep === "error") {
    return <p>{localBuildProgress.formattedError}</p>;
  }

  if (!localBuildProgress) {
    return (
      <Container>
        <Stack>
          <VisualTestsIcon />
          <Heading>Get started with visual testing</Heading>
          <Text>
            Take an image snapshot of each story to save their “last known good state” as test
            baselines.{" "}
          </Text>
          <Button small secondary onClick={startDevBuild}>
            Take snapshots
          </Button>
        </Stack>
      </Container>
    );
  }

  if (
    localBuildProgress &&
    localBuildProgress.currentStep === "complete" &&
    !catchAChange &&
    !runningSecondBuild
  ) {
    return (
      <Container>
        <Stack>
          <VisualTestsIcon />
          <Heading>Nice. You saved your stories as a test baseline.</Heading>
          <Text>This story was indexed and snapshotted in a standardized cloud browser.</Text>
          <img src="/Snapshot-Preview.png" alt="Snapshot Preview" />
          <p>Let’s see the superpower of catching visual changes.</p>
          <Button small secondary onClick={onCatchAChange}>
            Catch a UI change
          </Button>
        </Stack>
      </Container>
    );
  }

  if (
    localBuildProgress &&
    localBuildProgress.currentStep === "complete" &&
    catchAChange &&
    initialGitHash === gitInfo.uncommittedHash
  ) {
    return (
      <Container>
        <Stack>
          <VisualTestsIcon />
          <Heading>Make a change to this story</Heading>
          <Text>
            In your code, adjust the markup, styling, or assets to see how visual testing works.
            Don’t worry, you can undo it later. Here are a few ideas to get you started.
          </Text>
          <p>Shift the color palette</p>
          <p>Embiggen the type</p>
          <p>Change the layout</p>

          <p>Let’s see the superpower of catching visual changes.</p>
          {initialGitHash === gitInfo.uncommittedHash ? (
            <p>Make a change to this story</p>
          ) : (
            <p>Changes detecte!</p>
          )}
        </Stack>
      </Container>
    );
  }

  if (
    localBuildProgress &&
    localBuildProgress.currentStep === "complete" &&
    catchAChange &&
    initialGitHash !== gitInfo.uncommittedHash
  ) {
    return (
      <Container>
        <Stack>
          <VisualTestsIcon />
          <Heading>Changes detected</Heading>
          <Text>
            Time to run your first visual test! Visual tests will pinpoint the exact changes made to
            this Story.
          </Text>
          {localBuildProgress ? (
            <BuildProgressInline localBuildProgress={localBuildProgress} />
          ) : (
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
          )}
        </Stack>
      </Container>
    );
  }

  if (localBuildProgress && localBuildProgress.currentStep !== "error") {
    // When the build is in progress, show the build progress bar
    return (
      <Container>
        <Stack>
          <VisualTestsIcon />
          <Heading>Get started with visual testing</Heading>
          <Text>
            Take an image snapshot of each story to save their “last known good state” as test
            baselines.{" "}
          </Text>
          <BuildProgressInline localBuildProgress={localBuildProgress} />
        </Stack>
      </Container>
    );
  }
  // TODO: We shouldn't need a default case like this
  return <Container>No Screen Selected</Container>;
};
