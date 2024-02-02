import { Icons, Link } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Eyebrow } from "../../components/Eyebrow";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { Section, Sections } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { BuildStatus, TestResult } from "../../gql/graphql";
import { LocalBuildProgress } from "../../types";
import { useBuildState, useSelectedBuildState, useSelectedStoryState } from "./BuildContext";
import { BuildEyebrow } from "./BuildEyebrow";
import { useControlsDispatch, useControlsState } from "./ControlsContext";
import { RenderSettings } from "./RenderSettings";
import { useReviewTestState } from "./ReviewTestContext";
import { SnapshotComparison } from "./SnapshotComparison";
import { Warnings } from "./Warnings";

interface BuildResultsProps {
  branch: string;
  dismissBuildError: () => void;
  isOutdated: boolean;
  localBuildProgress?: LocalBuildProgress;
  switchToLastBuildOnBranch?: () => void;
  storyId: string;
  startDevBuild: () => void;
  setAccessToken: (accessToken: string | null) => void;
}

export const Warning = styled.div(({ theme }) => ({
  color: theme.color.warning,
  background: theme.background.warning,
  padding: 10,
  lineHeight: "18px",
  position: "relative",
}));

export const BuildResults = ({
  branch,
  dismissBuildError,
  isOutdated,
  localBuildProgress,
  switchToLastBuildOnBranch,
  startDevBuild,
  storyId,
  setAccessToken,
}: BuildResultsProps) => {
  const { settingsVisible, warningsVisible } = useControlsState();
  const { toggleSettings, toggleWarnings } = useControlsDispatch();

  const { lastBuildOnBranch, lastBuildOnBranchIsReady, lastBuildOnBranchIsSelectable } =
    useBuildState();

  const selectedBuild = useSelectedBuildState();
  const selectedStory = useSelectedStoryState();

  const { buildIsReviewable, userCanReview } = useReviewTestState();

  const isLocalBuildInProgress =
    !!localBuildProgress && localBuildProgress.currentStep !== "complete";

  // Do we want to encourage them to switch to the next build?
  const shouldSwitchToLastBuildOnBranch = !!(
    !buildIsReviewable &&
    lastBuildOnBranchIsReady &&
    lastBuildOnBranchIsSelectable &&
    !!switchToLastBuildOnBranch
  );

  const lastBuildOnBranchInProgress = lastBuildOnBranch?.status === BuildStatus.InProgress;
  const showBuildStatus =
    // We always want to show the status of the running build (until it is done)
    isLocalBuildInProgress ||
    // Even if there's no build running, we need to tell them why they can't review, unless
    // the story is superseded and the UI is already telling them
    (!buildIsReviewable && !shouldSwitchToLastBuildOnBranch);
  const localBuildProgressIsLastBuildOnBranch =
    localBuildProgress && localBuildProgress?.buildId === lastBuildOnBranch?.id;

  const buildStatus = showBuildStatus && (
    <BuildEyebrow
      branch={branch}
      dismissBuildError={dismissBuildError}
      localBuildProgress={
        localBuildProgressIsLastBuildOnBranch || isLocalBuildInProgress
          ? localBuildProgress
          : undefined
      }
      lastBuildOnBranchInProgress={lastBuildOnBranchInProgress}
      switchToLastBuildOnBranch={switchToLastBuildOnBranch}
    />
  );

  const isNewStory = selectedStory?.hasTests && selectedStory?.tests.length === 0;

  const isLocalBuildProgressOnSelectedBuild =
    selectedBuild.id !== `Build:${localBuildProgress?.buildId}`;

  if (isNewStory) {
    return (
      <Sections>
        <Section grow>
          <Container>
            <Heading>New story found</Heading>
            <CenterText>
              Take an image snapshot of this story to save its “last known good state” as a test
              baseline. This unlocks visual regression testing so you can see exactly what has
              changed down to the pixel.
            </CenterText>
            {localBuildProgress && isLocalBuildProgressOnSelectedBuild ? (
              <BuildProgressInline localBuildProgress={localBuildProgress} />
            ) : (
              <>
                <br />
                <Button
                  belowText
                  size="medium"
                  variant="solid"
                  onClick={() => startDevBuild()}
                  disabled={isLocalBuildInProgress}
                >
                  Create visual test
                </Button>
              </>
            )}
          </Container>
        </Section>
        <FooterSection setAccessToken={setAccessToken} />
      </Sections>
    );
  }
  // It shouldn't be possible for one test to be skipped but not all of them
  const isSkipped = !!selectedStory?.tests?.find((t) => t.result === TestResult.Skipped);
  if (isSkipped) {
    return (
      <Sections>
        {buildStatus}
        <Section grow>
          <Container>
            <Heading>This story was skipped</Heading>
            <CenterText>
              If you would like to resume testing it, comment out or remove
              `parameters.chromatic.disableSnapshot = true` from the CSF file.
            </CenterText>
            <Button
              belowText
              size="medium"
              tertiary
              // @ts-expect-error Button component is not quite typed properly
              target="_new"
            >
              <a href="https://www.chromatic.com/docs/ignoring-elements#ignore-stories">
                <Icons icon="document" />
                View Docs
              </a>
            </Button>
          </Container>
        </Section>
        <FooterSection setAccessToken={setAccessToken} />
      </Sections>
    );
  }

  const { status } = selectedBuild;
  const isSelectedBuildStarting = [
    BuildStatus.Announced,
    BuildStatus.Published,
    BuildStatus.Prepared,
  ].includes(status);
  const isBuildFailed = status === BuildStatus.Failed;
  const isReviewLocked = status === BuildStatus.Pending && (!userCanReview || !buildIsReviewable);

  return (
    <Sections>
      {buildStatus}

      {!buildStatus && isReviewLocked && (
        <Eyebrow>
          {userCanReview ? (
            <>Reviewing is disabled because there's a newer build on {branch}.</>
          ) : (
            <>
              You do not have permission to accept changes.{" "}
              <Link
                href="https://www.chromatic.com/docs/collaborators#roles"
                target="_blank"
                withArrow
              >
                Learn about roles
              </Link>
            </>
          )}
        </Eyebrow>
      )}

      <Section grow last hidden={settingsVisible || warningsVisible}>
        <SnapshotComparison
          hidden={settingsVisible || warningsVisible}
          {...{
            isOutdated,
            isStarting: isSelectedBuildStarting,
            startDevBuild,
            isBuildFailed,
            shouldSwitchToLastBuildOnBranch,
            switchToLastBuildOnBranch,
            selectedBuild,
            setAccessToken,
            storyId,
          }}
        />
      </Section>

      <Section grow last hidden={!settingsVisible}>
        <RenderSettings onClose={() => toggleSettings(false)} />
      </Section>
      <Section grow last hidden={!warningsVisible}>
        <Warnings onClose={() => toggleWarnings(false)} />
      </Section>
    </Sections>
  );
};
