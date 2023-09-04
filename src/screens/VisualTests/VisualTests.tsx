import { Icons, Loader } from "@storybook/components";
import { Icon, TooltipNote, WithTooltip } from "@storybook/design-system";
// eslint-disable-next-line import/no-unresolved
import { GitInfo } from "chromatic/node";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "urql";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Bar, Col, Row, Section, Sections, Text } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { GitInfoPayload, RunningBuildPayload } from "../../constants";
import { getFragment, graphql } from "../../gql";
import {
  AddonVisualTestsBuildQuery,
  AddonVisualTestsBuildQueryVariables,
  BuildStatus,
  ReviewTestBatch,
  ReviewTestInputStatus,
  TestResult,
  TestStatus,
} from "../../gql/graphql";
import { statusMap, StatusUpdate, testsToStatusUpdate } from "../../utils/testsToStatusUpdate";
import { BuildProgress } from "./BuildProgress";
import { RenderSettings } from "./RenderSettings";
import { SnapshotComparison } from "./SnapshotComparison";
import { StoryInfo } from "./StoryInfo";
import { Warnings } from "./Warnings";

const QueryBuild = graphql(/* GraphQL */ `
  query AddonVisualTestsBuild(
    $projectId: ID!
    $branch: String!
    $gitUserEmailHash: String!
    $slug: String
    $storyId: String!
    $testStatuses: [TestStatus!]!
    $storyBuildId: ID!
    $hasStoryBuildId: Boolean!
  ) {
    project(id: $projectId) {
      name
      lastBuild(
        branches: [$branch]
        slug: $slug
        localBuilds: { localBuildEmailHash: $gitUserEmailHash }
      ) {
        ...NextBuildFields
        ...StoryBuildFields @skip(if: $hasStoryBuildId)
      }
    }
    storyBuild: build(id: $storyBuildId) @include(if: $hasStoryBuildId) {
      ...StoryBuildFields
    }
  }
`);

const FragmentNextBuildFields = graphql(/* GraphQL */ `
  fragment NextBuildFields on Build {
    __typename
    id
    commit
    committedAt
    browsers {
      id
      key
      name
    }
    ... on StartedBuild {
      changeCount: testCount(results: [ADDED, CHANGED, FIXED])
      brokenCount: testCount(results: [CAPTURE_ERROR])
      testsForStatus: tests(first: 1000, statuses: $testStatuses) {
        nodes {
          ...StatusTestFields
        }
      }
    }
    ... on CompletedBuild {
      result
      changeCount: testCount(results: [ADDED, CHANGED, FIXED])
      brokenCount: testCount(results: [CAPTURE_ERROR])
      testsForStatus: tests(statuses: $testStatuses) {
        nodes {
          ...StatusTestFields
        }
      }
    }
  }
`);

const FragmentStoryBuildFields = graphql(/* GraphQL */ `
  fragment StoryBuildFields on Build {
    __typename
    id
    number
    branch
    uncommittedHash
    status
    ... on StartedBuild {
      startedAt
      testsForStory: tests(storyId: $storyId) {
        nodes {
          ...StoryTestFields
        }
      }
    }
    ... on CompletedBuild {
      startedAt
      testsForStory: tests(storyId: $storyId) {
        nodes {
          ...StoryTestFields
        }
      }
    }
  }
`);

const FragmentStatusTestFields = graphql(/* GraphQL */ `
  fragment StatusTestFields on Test {
    id
    status
    story {
      storyId
    }
  }
`);

const FragmentStoryTestFields = graphql(/* GraphQL */ `
  fragment StoryTestFields on Test {
    id
    status
    result
    webUrl
    comparisons {
      id
      result
      browser {
        id
        key
        name
        version
      }
      captureDiff {
        diffImage {
          imageUrl
          imageWidth
        }
      }
      headCapture {
        captureImage {
          imageUrl
          imageWidth
        }
      }
      baseCapture {
        captureImage {
          imageUrl
          imageWidth
        }
      }
      viewport {
        id
        name
        width
        isDefault
      }
    }
    parameters {
      viewport {
        id
        name
        width
        isDefault
      }
    }
    story {
      storyId
      name
      component {
        name
      }
    }
  }
`);

const MutationReviewTest = graphql(/* GraphQL */ `
  mutation ReviewTest($input: ReviewTestInput!) {
    reviewTest(input: $input) {
      updatedTests {
        id
        status
      }
      userErrors {
        ... on UserError {
          __typename
          message
        }
        ... on BuildSupersededError {
          build {
            id
          }
        }
        ... on TestUnreviewableError {
          test {
            id
          }
        }
      }
    }
  }
`);

interface VisualTestsProps {
  projectId: string;
  gitInfo: GitInfoPayload;
  runningBuild?: RunningBuildPayload;
  startDevBuild: () => void;
  setAccessToken: (accessToken: string | null) => void;
  updateBuildStatus: (update: StatusUpdate) => void;
  storyId: string;
}

export const VisualTests = ({
  runningBuild,
  startDevBuild,
  setAccessToken,
  updateBuildStatus,
  projectId,
  gitInfo,
  storyId,
}: VisualTestsProps) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);
  const [baselineImageVisible, setBaselineImageVisible] = useState(false);
  const toggleBaselineImage = () => setBaselineImageVisible(!baselineImageVisible);

  // The storyId and buildId that drive the test(s) we are currently looking at
  // The user can choose when to change story (via sidebar) and build (via opting into new builds)
  const [storyBuildInfo, setStoryBuildInfo] = useState<{
    storyId: string;
    buildId: string;
  }>();

  const [{ data, error }, rerun] = useQuery<
    AddonVisualTestsBuildQuery,
    AddonVisualTestsBuildQueryVariables
  >({
    query: QueryBuild,
    variables: {
      projectId,
      storyId,
      testStatuses: Object.keys(statusMap) as any as TestStatus[],
      branch: gitInfo.branch || "",
      ...(gitInfo.slug ? { slug: gitInfo.slug } : {}),
      gitUserEmailHash: gitInfo.userEmailHash,
      storyBuildId: storyBuildInfo?.buildId || "",
      hasStoryBuildId: !!storyBuildInfo,
    },
  });

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(rerun, 5000);
    return () => clearInterval(interval);
  }, [rerun]);

  const [{ fetching: isAccepting }, reviewTest] = useMutation(MutationReviewTest);

  const onAccept = useCallback(
    async (testId: string, batch: ReviewTestBatch) => {
      try {
        const { error: reviewError } = await reviewTest({
          input: { testId, status: ReviewTestInputStatus.Accepted, batch },
        });

        if (reviewError) throw reviewError;
      } catch (err) {
        // https://linear.app/chromaui/issue/AP-3279/error-handling
        // eslint-disable-next-line no-console
        console.log("Failed to accept changes:");
        // eslint-disable-next-line no-console
        console.log(err);
      }
    },
    [reviewTest]
  );

  const nextBuild = getFragment(FragmentNextBuildFields, data?.project?.lastBuild);
  // Before we set the storyInfo, we use the nextBuild for story data
  const storyBuild = getFragment(
    FragmentStoryBuildFields,
    data?.storyBuild ?? data?.project?.lastBuild
  );

  // If the next build is *newer* than the current commit, we don't want to switch to the build
  const nextBuildNewer = nextBuild && nextBuild.committedAt > gitInfo.committedAt;
  const canSwitchToNextBuild = nextBuild && !nextBuildNewer;

  // We always set status to the next build's status, as when we change to a new story we'll see
  // the next builds
  const buildStatusUpdate =
    canSwitchToNextBuild &&
    "testsForStatus" in nextBuild &&
    testsToStatusUpdate(getFragment(FragmentStatusTestFields, nextBuild.testsForStatus.nodes));

  useEffect(() => {
    if (buildStatusUpdate) updateBuildStatus(buildStatusUpdate);
    // We use the stringified version of buildStatusUpdate to do a deep diff
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(buildStatusUpdate), updateBuildStatus]);

  // Ensure we are holding the right story build
  useEffect(() => {
    setStoryBuildInfo((oldStoryBuildInfo) => {
      return (!oldStoryBuildInfo || oldStoryBuildInfo.storyId !== storyId) && nextBuild?.id
        ? {
            storyId,
            // If the next build is "too new" and we have an old build, stick to it.
            buildId: (!canSwitchToNextBuild && oldStoryBuildInfo?.buildId) || nextBuild.id,
          }
        : oldStoryBuildInfo;
    });
  }, [canSwitchToNextBuild, nextBuild?.id, storyId]);

  const switchToNextBuild = useCallback(
    () => canSwitchToNextBuild && setStoryBuildInfo({ storyId, buildId: nextBuild.id }),
    [canSwitchToNextBuild, nextBuild?.id, storyId]
  );

  const isStarting = ["initializing"].includes(runningBuild?.step);
  if (!nextBuild || error) {
    return (
      <Sections>
        <Section grow>
          {error && (
            <Row>
              <Col>
                <Text>{error.message}</Text>
              </Col>
            </Row>
          )}
          {!data && <Loader />}
          {data && !nextBuild && !error && (
            <Container>
              <Heading>Create a test baseline</Heading>
              <CenterText>
                Take an image snapshot of each story to save their &quot;last known good state&quot;
                as test baselines.
              </CenterText>
              <br />
              <Button small secondary onClick={startDevBuild} disabled={isStarting}>
                {isStarting ? (
                  <ProgressIcon parentComponent="Button" style={{ marginRight: 6 }} />
                ) : (
                  <Icons icon="play" />
                )}
                Take snapshots
              </Button>
            </Container>
          )}
        </Section>
        <Section>
          <Bar>
            <Col>
              <Text style={{ marginLeft: 5 }}>
                {data ? `Waiting for build on ${gitInfo.branch}` : "Loading..."}
              </Text>
            </Col>
            <Col push>
              <FooterMenu setAccessToken={setAccessToken} />
            </Col>
          </Bar>
        </Section>
      </Sections>
    );
  }

  const runningBuildInProgress = runningBuild && runningBuild.step !== "complete";
  const showBuildStatus =
    // We always want to show the status of the running build (until it is done)
    runningBuildInProgress ||
    // Even if there's no build running, we want to show the next build if it hasn't been selected.
    (canSwitchToNextBuild && nextBuild.id !== storyBuild?.id);
  const runningBuildIsNextBuild = runningBuild && runningBuild?.id === nextBuild?.id;
  const buildStatus = showBuildStatus && (
    <BuildProgress
      runningBuild={(runningBuildIsNextBuild || runningBuildInProgress) && runningBuild}
      switchToNextBuild={canSwitchToNextBuild && switchToNextBuild}
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

  const startedAt = "startedAt" in storyBuild && storyBuild.startedAt;
  const isOutdated = storyBuild && storyBuild.uncommittedHash !== gitInfo.uncommittedHash;
  const isBuildFailed = storyBuild.status === BuildStatus.Failed;
  return (
    <Sections>
      {buildStatus}

      <Section grow hidden={settingsVisible || warningsVisible}>
        <StoryInfo
          {...{
            tests: storyTests,
            isOutdated,
            startedAt,
            isStarting,
            startDevBuild,
            isBuildFailed,
          }}
        />
        {!isStarting && storyTests && storyTests.length > 0 && (
          <SnapshotComparison
            {...{ tests: storyTests, isAccepting, isOutdated, onAccept, baselineImageVisible }}
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
