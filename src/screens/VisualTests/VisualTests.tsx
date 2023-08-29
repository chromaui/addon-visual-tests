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
import { BuildProgressPayload } from "../../constants";
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
  ) {
    project(id: $projectId) {
      name
      lastBuild(
        branches: [$branch]
        slug: $slug
        localBuilds: { localBuildEmailHash: $gitUserEmailHash }
      ) {
        ...BuildFields
      }
    }
  }
`);

const FragmentBuildFields = graphql(/* GraphQL */ `
  fragment BuildFields on Build {
    __typename
    id
    number
    branch
    commit
    uncommittedHash
    status
    browsers {
      id
      key
      name
    }
    ... on StartedBuild {
      changeCount: testCount(results: [ADDED, CHANGED, FIXED])
      brokenCount: testCount(results: [CAPTURE_ERROR])
      startedAt
      testsForStatus: tests(first: 1000, statuses: $testStatuses) {
        nodes {
          ...StatusTestFields
        }
      }
      testsForStory: tests(storyId: $storyId) {
        nodes {
          ...StoryTestFields
        }
      }
    }
    ... on CompletedBuild {
      result
      changeCount: testCount(results: [ADDED, CHANGED, FIXED])
      brokenCount: testCount(results: [CAPTURE_ERROR])
      startedAt
      testsForStatus: tests(statuses: $testStatuses) {
        nodes {
          ...StatusTestFields
        }
      }
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
  gitInfo: Pick<GitInfo, "branch" | "slug" | "userEmailHash" | "uncommittedHash">;
  isStarting: boolean;
  buildProgress?: BuildProgressPayload;
  lastDevBuildId?: string;
  startDevBuild: () => void;
  setAccessToken: (accessToken: string | null) => void;
  updateBuildStatus: (update: StatusUpdate) => void;
  storyId: string;
}

export const VisualTests = ({
  isStarting,
  buildProgress,
  lastDevBuildId,
  startDevBuild,
  setAccessToken,
  updateBuildStatus,
  projectId,
  gitInfo,
  storyId,
}: VisualTestsProps) => {
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

  const build = getFragment(FragmentBuildFields, data?.project?.lastBuild);
  const isOutdated = build && build.uncommittedHash !== gitInfo.uncommittedHash;

  const buildStatusUpdate =
    build &&
    "testsForStatus" in build &&
    testsToStatusUpdate(getFragment(FragmentStatusTestFields, build.testsForStatus.nodes));

  useEffect(() => {
    if (buildStatusUpdate) updateBuildStatus(buildStatusUpdate);
    // We use the stringified version of buildStatusUpdate to do a deep diff
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(buildStatusUpdate), updateBuildStatus]);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);
  const [baselineImageVisible, setBaselineImageVisible] = useState(false);
  const toggleBaselineImage = () => setBaselineImageVisible(!baselineImageVisible);

  if (!build || error) {
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
          {data && !build && !error && (
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

  // TODO -- we need to drop this when the build is selected
  const buildStatus = buildProgress && <BuildProgress buildProgress={buildProgress} />;

  const tests = [
    ...getFragment(
      FragmentStoryTestFields,
      "testsForStory" in build ? build.testsForStory.nodes : []
    ),
  ];
  const startedAt = "startedAt" in build && build.startedAt;
  const isBuildFailed = build.status === BuildStatus.Failed;

  // It shouldn't be possible for one test to be skipped but not all of them
  const isSkipped = !!tests?.find((t) => t.result === TestResult.Skipped);
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

  return (
    <Sections>
      {buildStatus}

      <Section grow hidden={settingsVisible || warningsVisible}>
        <StoryInfo
          {...{ tests, isOutdated, startedAt, isStarting, startDevBuild, isBuildFailed }}
        />
        {!isStarting && tests && tests.length > 0 && (
          <SnapshotComparison
            {...{ tests, isAccepting, isOutdated, onAccept, baselineImageVisible }}
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
                <b>Baseline</b> Build {build.number} on {build.branch}
              </Text>
            ) : (
              <Text style={{ marginLeft: 5, width: "100%" }}>
                <b>Latest</b> Build {build.number} on {build.branch}
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
