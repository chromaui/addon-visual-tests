import { Icons, Link, TooltipNote, WithTooltip } from "@storybook/components";
import React, { useState } from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Eyebrow } from "../../components/Eyebrow";
import { Heading } from "../../components/Heading";
import { Section, Sections } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { getFragment } from "../../gql";
import {
  BuildStatus,
  LastBuildOnBranchBuildFieldsFragment,
  ReviewTestBatch,
  SelectedBuildFieldsFragment,
  StoryTestFieldsFragment,
  TestResult,
  TestStatus,
} from "../../gql/graphql";
import { LocalBuildProgress } from "../../types";
import { BuildEyebrow } from "./BuildEyebrow";
import { FragmentStoryTestFields } from "./graphql";
import { RenderSettings } from "./RenderSettings";
import { SnapshotComparison } from "./SnapshotComparison";
import { Warnings } from "./Warnings";

interface BuildResultsProps {
  branch: string;
  localBuildProgress?: LocalBuildProgress;
  selectedBuild: SelectedBuildFieldsFragment;
  storyId: string;
  lastBuildOnBranch?: LastBuildOnBranchBuildFieldsFragment;
  lastBuildOnBranchCompletedStory: boolean;
  switchToLastBuildOnBranch?: () => void;
  startDevBuild: () => void;
  userCanReview: boolean;
  isReviewing: boolean;
  onAccept: (testId: StoryTestFieldsFragment["id"], batch?: ReviewTestBatch) => void;
  onUnaccept: (testId: string) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
}

export const BuildResults = ({
  branch,
  localBuildProgress,
  lastBuildOnBranch,
  lastBuildOnBranchCompletedStory,
  switchToLastBuildOnBranch,
  startDevBuild,
  userCanReview,
  isReviewing,
  onAccept,
  onUnaccept,
  selectedBuild,
  storyId,
  setAccessToken,
}: BuildResultsProps) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);
  const [baselineImageVisible, setBaselineImageVisible] = useState(false);
  const toggleBaselineImage = () => setBaselineImageVisible(!baselineImageVisible);

  const prevStoryIdRef = React.useRef(storyId);

  React.useEffect(() => {
    // This component doesn't unmount when the selected build changes, so we need to reset state values
    if (prevStoryIdRef.current !== storyId) {
      setBaselineImageVisible(false);
      setSettingsVisible(false);
      setWarningsVisible(false);
    }
    prevStoryIdRef.current = storyId;
  }, [storyId, baselineImageVisible]);

  const isLocalBuildInProgress =
    localBuildProgress && localBuildProgress.currentStep !== "complete";

  const storyTests = [
    ...getFragment(
      FragmentStoryTestFields,
      selectedBuild && "testsForStory" in selectedBuild && selectedBuild.testsForStory
        ? selectedBuild.testsForStory.nodes
        : []
    ),
  ];

  const isReviewable = lastBuildOnBranch?.id === selectedBuild?.id;
  const isStorySuperseded = !isReviewable && lastBuildOnBranchCompletedStory;
  // Do we want to encourage them to switch to the next build?
  const shouldSwitchToLastBuildOnBranch = isStorySuperseded && !!switchToLastBuildOnBranch;

  const lastBuildOnBranchInProgress = lastBuildOnBranch?.status === BuildStatus.InProgress;
  const showBuildStatus =
    // We always want to show the status of the running build (until it is done)
    isLocalBuildInProgress ||
    // Even if there's no build running, we need to tell them why they can't review, unless
    // the story is superseded and the UI is already telling them
    (!isReviewable && !shouldSwitchToLastBuildOnBranch);
  const localBuildProgressIsLastBuildOnBranch =
    localBuildProgress && localBuildProgress?.buildId === lastBuildOnBranch?.id;

  const buildStatus = showBuildStatus && (
    <BuildEyebrow
      branch={branch}
      localBuildProgress={
        localBuildProgressIsLastBuildOnBranch || isLocalBuildInProgress
          ? localBuildProgress
          : undefined
      }
      lastBuildOnBranchInProgress={lastBuildOnBranchInProgress}
      switchToLastBuildOnBranch={switchToLastBuildOnBranch}
    />
  );

  // It shouldn't be possible for one test to be skipped but not all of them
  const isSkipped = !!storyTests?.find((t) => t.result === TestResult.Skipped);
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
              small
              tertiary
              containsIcon
              // @ts-expect-error Button component is not quite typed properly
              target="_new"
              isLink
              href="https://www.chromatic.com/docs/ignoring-elements#ignore-stories"
            >
              <Icons icon="document" />
              View Docs
            </Button>
          </Container>
        </Section>
      </Sections>
    );
  }

  const { status } = selectedBuild;
  const startedAt = "startedAt" in selectedBuild && selectedBuild.startedAt;
  const isSelectedBuildStarting = [
    BuildStatus.Announced,
    BuildStatus.Published,
    BuildStatus.Prepared,
  ].includes(status);
  const isBuildFailed = status === BuildStatus.Failed;
  const isReviewLocked = status === BuildStatus.Pending && (!userCanReview || !isReviewable);

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

      <Section grow hidden={settingsVisible || warningsVisible}>
        <SnapshotComparison
          hidden={settingsVisible || warningsVisible}
          {...{
            tests: storyTests,
            startedAt,
            isStarting: isSelectedBuildStarting,
            startDevBuild,
            isBuildFailed,
            shouldSwitchToLastBuildOnBranch,
            switchToLastBuildOnBranch,
            userCanReview,
            isReviewable,
            isReviewing,
            onAccept,
            onUnaccept,
            baselineImageVisible,
            toggleBaselineImage,
            selectedBuild,
            setSettingsVisible,
            settingsVisible,
            setWarningsVisible,
            warningsVisible,
            setAccessToken,
            storyId,
          }}
        />
      </Section>

      <Section grow hidden={!settingsVisible}>
        <RenderSettings onClose={() => setSettingsVisible(false)} />
      </Section>
      <Section grow hidden={!warningsVisible}>
        <Warnings onClose={() => setWarningsVisible(false)} />
      </Section>
    </Sections>
  );
};
