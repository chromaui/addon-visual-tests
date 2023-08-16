import { logger } from "@storybook/client-logger";
import { Icons, Loader } from "@storybook/components";
import { Icon } from "@storybook/design-system";
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
import { getFragment, graphql } from "../../gql";
import {
  BuildQuery,
  BuildQueryVariables,
  ReviewTestBatch,
  ReviewTestInputStatus,
} from "../../gql/graphql";
import { StatusUpdate, testsToStatusUpdate } from "../../utils/testsToStatusUpdate";
import { BuildInfo } from "./BuildInfo";
import { RenderSettings } from "./RenderSettings";
import { SnapshotComparison } from "./SnapshotComparison";
import { Warnings } from "./Warnings";

const QueryBuild = graphql(/* GraphQL */ `
  query Build(
    $hasBuildId: Boolean!
    $buildId: ID!
    $projectId: ID!
    $branch: String!
    $slug: String
  ) {
    build(id: $buildId) @include(if: $hasBuildId) {
      ...BuildFields
    }
    project(id: $projectId) @skip(if: $hasBuildId) {
      name
      lastBuild(branches: [$branch], slug: $slug) {
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
      tests {
        nodes {
          ...TestFields
        }
      }
    }
    ... on CompletedBuild {
      result
      changeCount: testCount(results: [ADDED, CHANGED, FIXED])
      brokenCount: testCount(results: [CAPTURE_ERROR])
      startedAt
      tests {
        nodes {
          ...TestFields
        }
      }
    }
  }
`);

const FragmentTestFields = graphql(/* GraphQL */ `
  fragment TestFields on Test {
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
        }
      }
      headCapture {
        captureImage {
          imageUrl
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
  gitInfo: GitInfo;
  isStarting: boolean;
  lastDevBuildId?: string;
  startDevBuild: () => void;
  setAccessToken: (accessToken: string | null) => void;
  updateBuildStatus: (update: StatusUpdate) => void;
  storyId: string;
}

let last: any;
export const VisualTests = ({
  isStarting,
  lastDevBuildId,
  startDevBuild,
  setAccessToken,
  updateBuildStatus,
  projectId,
  gitInfo,
  storyId,
}: VisualTestsProps) => {
  const [{ data, error }, rerun] = useQuery<BuildQuery, BuildQueryVariables>({
    query: QueryBuild,
    variables: {
      hasBuildId: !!lastDevBuildId,
      buildId: lastDevBuildId || "",
      projectId,
      branch: gitInfo.branch || "",
      ...(gitInfo.slug ? { slug: gitInfo.slug } : {}),
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

  const build = getFragment(FragmentBuildFields, data?.build || data?.project?.lastBuild);

  const buildStatusUpdate =
    build &&
    "tests" in build &&
    testsToStatusUpdate(getFragment(FragmentTestFields, build.tests.nodes));

  const isOutdated = build && build.uncommittedHash !== gitInfo.uncommittedHash;

  useEffect(() => {
    last = {
      buildStatusUpdate,
      string: JSON.stringify(buildStatusUpdate),
    };
    if (buildStatusUpdate) {
      updateBuildStatus(buildStatusUpdate);
    }
    // We use the stringified version of buildStatusUpdate to do a deep diff
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(buildStatusUpdate), updateBuildStatus]);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);

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

  const allTests = getFragment(FragmentTestFields, "tests" in build ? build.tests.nodes : []);
  const tests = allTests.filter((test) => test.story?.storyId === storyId);

  const viewportCount = new Set(allTests.map((t) => t.parameters.viewport.id)).size;
  return (
    <Sections>
      <Section grow hidden={settingsVisible || warningsVisible}>
        <BuildInfo {...{ build, viewportCount, isOutdated, isStarting, startDevBuild }} />
        {/* The key here is to ensure the useTests helper gets to reset each time we change story */}
        {tests.length > 0 && (
          <SnapshotComparison key={storyId} {...{ tests, isAccepting, isOutdated, onAccept }} />
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
            <Text style={{ marginLeft: 5 }}>Latest snapshot on {build.branch}</Text>
          </Col>
          <Col push>
            <IconButton
              active={settingsVisible}
              aria-label={`${settingsVisible ? "Hide" : "Show"} render settings`}
              onClick={() => {
                setSettingsVisible(!settingsVisible);
                setWarningsVisible(false);
              }}
            >
              <Icon icon="controls" />
            </IconButton>
          </Col>
          <Col>
            <IconButton
              active={warningsVisible}
              aria-label={`${warningsVisible ? "Hide" : "Show"} warnings`}
              onClick={() => {
                setWarningsVisible(!warningsVisible);
                setSettingsVisible(false);
              }}
              status="warning"
            >
              <Icon icon="alert" />2
            </IconButton>
          </Col>
          <Col>
            <FooterMenu setAccessToken={setAccessToken} />
          </Col>
        </Bar>
      </Section>
    </Sections>
  );
};
