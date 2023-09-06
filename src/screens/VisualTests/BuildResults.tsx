import { Icons } from "@storybook/components";
import { Icon, TooltipNote, WithTooltip } from "@storybook/design-system";
import React, { useState } from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { IconButton } from "../../components/IconButton";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { RunningBuildPayload } from "../../constants";
import { getFragment } from "../../gql";
import {
  BuildStatus,
  NextBuildFieldsFragment,
  ReviewTestBatch,
  StoryBuildFieldsFragment,
  TestResult,
} from "../../gql/graphql";
import { BuildProgress } from "./BuildProgress";
import { FragmentStoryTestFields } from "./graphql";
import { RenderSettings } from "./RenderSettings";
import { SnapshotComparison } from "./SnapshotComparison";
import { StoryInfo } from "./StoryInfo";
import { Warnings } from "./Warnings";

interface BuildResultsProps {
  runningBuild: RunningBuildPayload;
  storyBuild: StoryBuildFieldsFragment;
  nextBuild: NextBuildFieldsFragment;
  switchToNextBuild?: () => void;
  startDevBuild: () => void;
  isReviewing: boolean;
  onAccept: (testId: string, batch: ReviewTestBatch) => Promise<void>;
  onUnaccept: (testId: string) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
  uncommittedHash: string;
}

export const BuildResults = ({
  runningBuild,
  nextBuild,
  switchToNextBuild,
  startDevBuild,
  isReviewing,
  onAccept,
  onUnaccept,
  storyBuild,
  setAccessToken,
  uncommittedHash,
}: BuildResultsProps) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);
  const [baselineImageVisible, setBaselineImageVisible] = useState(false);
  const toggleBaselineImage = () => setBaselineImageVisible(!baselineImageVisible);

  const isRunningBuildInProgress = runningBuild && runningBuild.step !== "complete";
  const showBuildStatus =
    // We always want to show the status of the running build (until it is done)
    isRunningBuildInProgress ||
    // Even if there's no build running, we want to show the next build if it hasn't been selected.
    (switchToNextBuild && nextBuild.id !== storyBuild?.id);
  const runningBuildIsNextBuild = runningBuild && runningBuild?.id === nextBuild.id;
  const buildStatus = showBuildStatus && (
    <BuildProgress
      runningBuild={(runningBuildIsNextBuild || isRunningBuildInProgress) && runningBuild}
      switchToNextBuild={switchToNextBuild}
    />
  );

  const storyTests = [
    ...getFragment(
      FragmentStoryTestFields,
      "testsForStory" in storyBuild ? storyBuild.testsForStory.nodes : []
    ),
  ];

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
  ].includes(storyBuild.status);
  const startedAt = "startedAt" in storyBuild && storyBuild.startedAt;
  const isOutdated = storyBuild.uncommittedHash !== uncommittedHash;
  const isBuildFailed = storyBuild.status === BuildStatus.Failed;
  const isReviewable = storyBuild.id === nextBuild.id;

  return (
    <Sections>
      {buildStatus}

      <Section grow hidden={settingsVisible || warningsVisible}>
        <StoryInfo
          {...{
            tests: storyTests,
            isOutdated,
            startedAt,
            isStarting: isStoryBuildStarting,
            startDevBuild,
            isBuildFailed,
          }}
        />
        {!isStoryBuildStarting && storyTests && storyTests.length > 0 && (
          <SnapshotComparison
            {...{
              tests: storyTests,
              isReviewable,
              isReviewing,
              isOutdated,
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
                <Icon icon="transfer" />
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
