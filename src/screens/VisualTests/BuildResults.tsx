import { Icons, Link, TooltipNote, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { useState } from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Eyebrow } from "../../components/Eyebrow";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { IconButton } from "../../components/IconButton";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { getFragment } from "../../gql";
import {
  BuildStatus,
  LastBuildOnBranchBuildFieldsFragment,
  ReviewTestBatch,
  SelectedBuildFieldsFragment,
  TestResult,
} from "../../gql/graphql";
import { LocalBuildProgress } from "../../types";
import { BuildEyebrow } from "./BuildEyebrow";
import { FragmentStoryTestFields } from "./graphql";
import { RenderSettings } from "./RenderSettings";
import { SnapshotComparison } from "./SnapshotComparison";
import { StoryInfo } from "./StoryInfo";
import { Warnings } from "./Warnings";

interface BuildResultsProps {
  branch: string;
  localBuildProgress: LocalBuildProgress;
  selectedBuild?: SelectedBuildFieldsFragment;
  lastBuildOnBranch: LastBuildOnBranchBuildFieldsFragment;
  lastBuildOnBranchCompletedStory: boolean;
  switchToLastBuildOnBranch?: () => void;
  startDevBuild: () => void;
  userCanReview: boolean;
  isReviewing: boolean;
  onAccept: (testId: string, batch: ReviewTestBatch) => Promise<void>;
  onUnaccept: (testId: string) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
}

export const Warning = styled.div(({ theme }) => ({
  color: theme.color.warning,
  background: theme.background.warning,
  padding: "10px",
  lineHeight: "18px",
  position: "relative",
}));

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
  setAccessToken,
}: BuildResultsProps) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);
  const [baselineImageVisible, setBaselineImageVisible] = useState(false);
  const toggleBaselineImage = () => setBaselineImageVisible(!baselineImageVisible);

  const isLocalBuildInProgress =
    localBuildProgress && localBuildProgress.currentStep !== "complete";

  const storyTests = [
    ...getFragment(
      FragmentStoryTestFields,
      selectedBuild && "testsForStory" in selectedBuild ? selectedBuild.testsForStory.nodes : []
    ),
  ];

  const isReviewable = lastBuildOnBranch.id === selectedBuild?.id;
  const isStorySuperseded = !isReviewable && lastBuildOnBranchCompletedStory;
  // Do we want to encourage them to switch to the next build?
  const shouldSwitchToLastBuildOnBranch = isStorySuperseded && !!switchToLastBuildOnBranch;

  const lastBuildOnBranchInProgress = lastBuildOnBranch.status === BuildStatus.InProgress;
  const showBuildStatus =
    // We always want to show the status of the running build (until it is done)
    isLocalBuildInProgress ||
    // Even if there's no build running, we need to tell them why they can't review, unless
    // the story is superseded and the UI is already telling them
    (!isReviewable && !shouldSwitchToLastBuildOnBranch);
  const localBuildProgressIsNextBuild =
    localBuildProgress && localBuildProgress?.buildId === lastBuildOnBranch.id;
  const buildStatus = showBuildStatus && (
    <BuildEyebrow
      branch={branch}
      localBuildProgress={
        (localBuildProgressIsNextBuild || isLocalBuildInProgress) && localBuildProgress
      }
      lastBuildOnBranchInProgress={lastBuildOnBranchInProgress}
      switchToLastBuildOnBranch={switchToLastBuildOnBranch}
    />
  );

  // If there are no tests yet, there is no baseline for this story. User needs to create one.
  const isCompletelyNewStory = storyTests.length === 0;

  if (isCompletelyNewStory) {
    return (
      <Sections>
        {buildStatus}
        <Section grow>
          <Container>
            <Heading>New story found</Heading>
            <CenterText>
              Take an image snapshot of this story to save its “last known good state” as a test
              baseline. This unlocks visual regression testing so you can see exactly what has
              changed down to the pixel.
            </CenterText>
            <Button
              belowText
              small
              secondary
              onClick={() => startDevBuild()}
              disabled={isLocalBuildInProgress}
            >
              Create visual test
            </Button>
          </Container>
        </Section>
      </Sections>
    );
  }
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
        <StoryInfo
          {...{
            tests: storyTests,
            startedAt,
            isStarting: isSelectedBuildStarting,
            startDevBuild,
            isBuildFailed,
            shouldSwitchToLastBuildOnBranch,
            switchToLastBuildOnBranch,
          }}
        />
        {!isSelectedBuildStarting && storyTests && storyTests.length > 0 && (
          <SnapshotComparison
            {...{
              tests: storyTests,
              userCanReview,
              isReviewable,
              isReviewing,
              onAccept,
              onUnaccept,
              baselineImageVisible,
            }}
          />
        )}
      </Section>

      <Section grow hidden={!settingsVisible}>
        <RenderSettings onClose={() => setSettingsVisible(false)} />
      </Section>
      <Section grow hidden={!warningsVisible}>
        <Warnings onClose={() => setWarningsVisible(false)} />
      </Section>
      <Section>
        <Bar>
          <Col>
            <WithTooltip
              tooltip={<TooltipNote note="Switch snapshot" />}
              trigger="hover"
              hasChrome={false}
            >
              <IconButton
                data-testid="button-toggle-snapshot"
                onClick={() => toggleBaselineImage()}
              >
                <Icons icon="transfer" />
              </IconButton>
            </WithTooltip>
          </Col>
          <Col style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            {baselineImageVisible ? (
              <Text style={{ marginLeft: 5, width: "100%" }}>
                <b>Baseline</b> Build {selectedBuild.number} on {selectedBuild.branch}
              </Text>
            ) : (
              <Text style={{ marginLeft: 5, width: "100%" }}>
                <b>Latest</b> Build {selectedBuild.number} on {selectedBuild.branch}
              </Text>
            )}
          </Col>
          {/* <Col push>
            <WithTooltip
              tooltip={<TooltipNote note="Render settings" />}
              trigger="hover"
              hasChrome={false}
            >
            <IconButton
              active={settingsVisible}
              aria-label={`${settingsVisible ? "Hide" : "Show"} render settings`}
              onClick={() => {
                setSettingsVisible(!settingsVisible);
                setWarningsVisible(false);
              }}
            >
              <Icons icon="controls" />
            </IconButton>
          </WithTooltip>
          </Col>
          <Col>
            <WithTooltip
              tooltip={<TooltipNote note="View warnings" />}
              trigger="hover"
              hasChrome={false}
            >
              <IconButton
                active={warningsVisible}
                aria-label={`${warningsVisible ? "Hide" : "Show"} warnings`}
                onClick={() => {
                  setWarningsVisible(!warningsVisible);
                  setSettingsVisible(false);
                }}
                status="warning"
              >
                <Icons icon="alert" />2
              </IconButton>
            </WithTooltip>
          </Col> */}
          <Col push>
            <FooterMenu setAccessToken={setAccessToken} />
          </Col>
        </Bar>
      </Section>
    </Sections>
  );
};
