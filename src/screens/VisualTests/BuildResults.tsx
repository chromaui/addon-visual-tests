import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import React, { useState } from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { IconButton } from "../../components/IconButton";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { getFragment } from "../../gql";
import {
  BuildStatus,
  NextBuildFieldsFragment,
  ReviewTestBatch,
  StoryBuildFieldsFragment,
  TestResult,
} from "../../gql/graphql";
import { RunningBuildPayload } from "../../types";
import { BuildEyebrow } from "./BuildEyebrow";
import { FragmentStoryTestFields } from "./graphql";
import { RenderSettings } from "./RenderSettings";
import { SnapshotComparison } from "./SnapshotComparison";
import { StoryInfo } from "./StoryInfo";
import { Warnings } from "./Warnings";

interface BuildResultsProps {
  branch: string;
  runningBuild: RunningBuildPayload;
  storyBuild?: StoryBuildFieldsFragment;
  nextBuild: NextBuildFieldsFragment;
  nextBuildCompletedStory: boolean;
  switchToNextBuild?: () => void;
  startDevBuild: () => void;
  isReviewing: boolean;
  onAccept: (testId: string, batch: ReviewTestBatch) => Promise<void>;
  onUnaccept: (testId: string) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
}

export const BuildResults = ({
  branch,
  runningBuild,
  nextBuild,
  nextBuildCompletedStory,
  switchToNextBuild,
  startDevBuild,
  isReviewing,
  onAccept,
  onUnaccept,
  storyBuild,
  setAccessToken,
}: BuildResultsProps) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);
  const [baselineImageVisible, setBaselineImageVisible] = useState(false);
  const toggleBaselineImage = () => setBaselineImageVisible(!baselineImageVisible);

  const isRunningBuildInProgress = runningBuild && runningBuild.currentStep !== "complete";

  const storyTests = [
    ...getFragment(
      FragmentStoryTestFields,
      storyBuild && "testsForStory" in storyBuild ? storyBuild.testsForStory.nodes : []
    ),
  ];

  const isReviewable = nextBuild.id === storyBuild?.id;
  const isStorySuperseded = !isReviewable && nextBuildCompletedStory;
  // Do we want to encourage them to switch to the next build?
  const shouldSwitchToNextBuild = isStorySuperseded && !!switchToNextBuild;

  const nextBuildInProgress = nextBuild.status === BuildStatus.InProgress;
  const showBuildStatus =
    // We always want to show the status of the running build (until it is done)
    isRunningBuildInProgress ||
    // Even if there's no build running, we need to tell them why they can't review, unless
    // the story is superseded and the UI is already telling them
    (!isReviewable && !shouldSwitchToNextBuild);
  const runningBuildIsNextBuild = runningBuild && runningBuild?.buildId === nextBuild.id;
  const buildStatus = showBuildStatus && (
    <BuildEyebrow
      branch={branch}
      runningBuild={(runningBuildIsNextBuild || isRunningBuildInProgress) && runningBuild}
      nextBuildInProgress={nextBuildInProgress}
      switchToNextBuild={switchToNextBuild}
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

  const isStoryBuildStarting = [
    BuildStatus.Announced,
    BuildStatus.Published,
    BuildStatus.Prepared,
  ].includes(storyBuild?.status);
  const startedAt = storyBuild && "startedAt" in storyBuild && storyBuild.startedAt;
  const isBuildFailed = storyBuild?.status === BuildStatus.Failed;

  return (
    <Sections>
      {buildStatus}

      <Section grow hidden={settingsVisible || warningsVisible}>
        <StoryInfo
          {...{
            tests: storyTests,
            startedAt,
            isStarting: isStoryBuildStarting,
            startDevBuild,
            isBuildFailed,
            shouldSwitchToNextBuild,
            switchToNextBuild,
          }}
        />
        {!isStoryBuildStarting && storyTests && storyTests.length > 0 && (
          <SnapshotComparison
            {...{
              tests: storyTests,
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
                <b>Baseline</b> Build {storyBuild.number} on {storyBuild.branch}
              </Text>
            ) : (
              <Text style={{ marginLeft: 5, width: "100%" }}>
                <b>Latest</b> Build {storyBuild.number} on {storyBuild.branch}
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
