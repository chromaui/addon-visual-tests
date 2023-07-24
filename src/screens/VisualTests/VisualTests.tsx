import { Loader } from "@storybook/components";
import { Icon } from "@storybook/design-system";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "urql";

import { IconButton } from "../../components/IconButton";
import { Bar, Col, Row, Section, Sections, Text } from "../../components/layout";
import { TooltipMenu } from "../../components/TooltipMenu";
import { getFragment, graphql } from "../../gql";
import {
  BuildQuery,
  BuildQueryVariables,
  ReviewTestBatch,
  ReviewTestInputStatus,
  TestFieldsFragment,
  TestResult,
  TestStatus,
} from "../../gql/graphql";
import { CompletedBuild, StartedBuild } from "../../types";
import { aggregateResult } from "../../utils/aggregateResult";
import { useProjectId } from "../../utils/useProjectId";
import { BuildInfo } from "./BuildInfo";
import { RenderSettings } from "./RenderSettings";
import { SnapshotComparison } from "./SnapshotComparison";
import { Warnings } from "./Warnings";

type ComparisonResult = any;

const QueryBuild = graphql(/* GraphQL */ `
  query Build($hasBuildId: Boolean!, $buildId: ID!, $projectId: ID!, $branch: String!) {
    build(id: $buildId) @include(if: $hasBuildId) {
      ...BuildFields
    }
    project(id: $projectId) @skip(if: $hasBuildId) {
      name
      lastBuild(branches: [$branch]) {
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
    status
    browsers {
      id
      key
      name
    }
    ... on StartedBuild {
      changeCount: testCount(results: [ADDED, CHANGED, FIXED])
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
  branch?: string;
  slug?: string;
  isOutdated?: boolean;
  isRunning?: boolean;
  lastDevBuildId?: string;
  runDevBuild: () => void;
  setAccessToken: (accessToken: string | null) => void;
  setIsOutdated: (isOutdated: boolean) => void;
  setIsRunning: (isRunning: boolean) => void;
  updateBuildStatus: (build: StartedBuild | CompletedBuild) => void;
  storyId: string;
}

export const VisualTests = ({
  isOutdated,
  isRunning,
  lastDevBuildId,
  runDevBuild,
  setAccessToken,
  setIsOutdated,
  setIsRunning,
  updateBuildStatus,
  projectId,
  branch,
  slug,
  storyId,
}: VisualTestsProps) => {
  // TODO: Replace hardcoded projectId with useProjectId hook and parameters
  const [{ data, fetching, error }, rerun] = useQuery<BuildQuery, BuildQueryVariables>({
    query: QueryBuild,
    variables: {
      hasBuildId: !!lastDevBuildId,
      buildId: lastDevBuildId || "",
      projectId,
      branch: branch || "",
      ...(slug ? { slug } : {}),
    },
  });

  const [{ fetching: isAccepting }, reviewTest] = useMutation(MutationReviewTest);

  const onAccept = useCallback(
    (testId: string, batch: ReviewTestBatch) =>
      reviewTest({ input: { testId, status: ReviewTestInputStatus.Accepted, batch } }),
    [reviewTest]
  );

  const build = getFragment(FragmentBuildFields, data?.build || data?.project?.lastBuild);

  useEffect(() => {
    if (!build) return;

    if ("tests" in build) {
      updateBuildStatus(build);
    }

    if ("result" in build) {
      setIsOutdated(false);
      setIsRunning(false);
    }
  }, [setIsOutdated, setIsRunning, updateBuildStatus, build]);

  useEffect(() => {
    let interval: any;
    if (isRunning) interval = setInterval(rerun, 5000);
    else clearInterval(interval);
    return () => clearInterval(interval);
  }, [isRunning, rerun]);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);

  if (fetching || error || !build) {
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
          {fetching && <Loader />}
          {!build && !fetching && !error && (
            <Section grow>
              <Row>
                <Col>
                  <Text>
                    Your project {data.project?.name} does not have any builds yet. Run a build a to
                    begin.
                  </Text>
                </Col>
              </Row>
            </Section>
          )}
        </Section>
        <Section>
          <Bar>
            <Col>
              <Text style={{ marginLeft: 5 }}>Loading...</Text>
            </Col>
            <Col push>
              <TooltipMenu
                placement="top"
                links={[
                  {
                    id: "logout",
                    title: "Log out",
                    icon: "user",
                    onClick: () => setAccessToken(null),
                  },
                  {
                    id: "learn",
                    title: "Learn about this addon",
                    icon: "question",
                    href: "https://www.chromatic.com/docs/test",
                  },
                ]}
              >
                <Icon icon="ellipsis" />
              </TooltipMenu>
            </Col>
          </Bar>
        </Section>
      </Sections>
    );
  }

  const allTests = getFragment(FragmentTestFields, "tests" in build ? build.tests.nodes : []);
  const tests = allTests.filter((test) => test.story?.storyId === storyId);

  const { changeCount, brokenCount, resultsByBrowser, resultsByViewport, viewportInfoById } =
    tests.reduce(
      (acc, test) => {
        if (test.result === TestResult.Changed) {
          acc.changeCount += 1;
        }
        if (test.result === TestResult.CaptureError || test.result === TestResult.SystemError) {
          acc.brokenCount += 1;
        }
        test.comparisons?.forEach(({ browser, result }) => {
          acc.resultsByBrowser[browser.id] = aggregateResult([
            result,
            acc.resultsByBrowser[browser.id],
          ]);
        });
        test.comparisons?.forEach(({ viewport, result }) => {
          acc.resultsByViewport[viewport.id] = aggregateResult([
            result,
            acc.resultsByViewport[viewport.id],
          ]);
        });
        acc.viewportInfoById[test.parameters.viewport.id] = test.parameters.viewport;
        return acc;
      },
      {
        changeCount: 0,
        brokenCount: 0,
        resultsByBrowser: {} as Record<string, ComparisonResult>,
        resultsByViewport: {} as Record<string, ComparisonResult>,
        viewportInfoById: {} as Record<string, TestFieldsFragment["parameters"]["viewport"]>,
      }
    );

  const test = tests.find(({ result }) => result === TestResult.Changed) || tests[0];
  const isPending = test?.status === TestStatus.Pending;
  const isInProgress = tests.some(({ status }) => status === TestStatus.InProgress);

  const browserCount = build.browsers.length;
  const viewportCount = Object.keys(viewportInfoById).length;

  const browserInfoById = Object.fromEntries(
    build.browsers.map((browser) => [browser.id, browser])
  );
  const browserResults = Object.entries(resultsByBrowser).map(([id, result]) => ({
    browser: browserInfoById[id],
    result,
  }));
  const viewportResults = Object.entries(resultsByViewport).map(([id, result]) => ({
    viewport: viewportInfoById[id],
    result,
  }));

  return (
    <Sections>
      <Section grow hidden={settingsVisible || warningsVisible}>
        <BuildInfo
          {...{
            status: build.status,
            startedAt: "startedAt" in build && build.startedAt,
            brokenCount,
            browserCount,
            changeCount,
            viewportCount,
            isInProgress,
            isOutdated,
            isPending,
            isRunning,
            runDevBuild,
          }}
        />
        <SnapshotComparison
          {...{
            test,
            changeCount,
            isAccepting,
            isInProgress,
            isOutdated,
            browserResults,
            viewportResults,
            onAccept,
          }}
        />
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
            <TooltipMenu
              placement="top"
              links={[
                {
                  id: "logout",
                  title: "Log out",
                  icon: "user",
                  onClick: () => setAccessToken(null),
                },
                {
                  id: "learn",
                  title: "Learn about this addon",
                  icon: "question",
                  href: "https://www.chromatic.com/docs/test",
                },
              ]}
            >
              <Icon icon="ellipsis" />
            </TooltipMenu>
          </Col>
        </Bar>
      </Section>
    </Sections>
  );
};
