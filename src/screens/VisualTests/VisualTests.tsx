import { Loader } from "@storybook/components";
import { Icon } from "@storybook/design-system";
import { formatDistance } from "date-fns";
import pluralize from "pluralize";
import React, { useEffect, useState } from "react";
import { useQuery } from "urql";

import { BrowserSelector } from "../../components/BrowserSelector";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { AlertIcon } from "../../components/icons/AlertIcon";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { Bar, Col, Row, Section, Sections, Text } from "../../components/layout";
import { Placeholder } from "../../components/Placeholder";
import { SnapshotImage } from "../../components/SnapshotImage";
import { TooltipMenu } from "../../components/TooltipMenu";
import { ViewportSelector } from "../../components/ViewportSelector";
import { graphql } from "../../gql";
import { BuildQuery, BuildQueryVariables, TestResult, TestStatus } from "../../gql/graphql";
import { aggregateResult } from "../../utils/aggregateResult";
import { RenderSettings } from "./RenderSettings";
import { Warnings } from "./Warnings";

type ComparisonResult = any;

export type StartedBuild = Extract<BuildQuery["build"], { __typename: "StartedBuild" }>;

const QueryBuild = graphql(/* GraphQL */ `
  query Build($buildId: ID!) {
    build(id: $buildId) {
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
            id
            status
            result
            comparisons {
              id
              browser {
                id
                key
                name
                version
              }
              viewport {
                id
                name
                width
                isDefault
              }
              result
            }
            parameters {
              viewport {
                id
                name
                width
                isDefault
              }
            }
          }
        }
      }
    }
  }
`);

interface VisualTestsProps {
  isOutdated?: boolean;
  isRunning?: boolean;
  lastDevBuildId?: string;
  runDevBuild: () => void;
  setAccessToken: (accessToken: string | null) => void;
}

export const VisualTests = ({
  isOutdated,
  isRunning,
  lastDevBuildId,
  runDevBuild,
  setAccessToken,
}: VisualTestsProps) => {
  console.log({ lastDevBuildId });

  const [{ data, fetching, error }, rerun] = useQuery<BuildQuery, BuildQueryVariables>({
    query: QueryBuild,
    variables: {
      buildId: lastDevBuildId,
    },
  });

  console.log({ data });

  useEffect(() => {
    let interval: any;
    if (isRunning) interval = setInterval(rerun, 5000);
    else clearInterval(interval);
    return () => clearInterval(interval);
  }, [isRunning, rerun]);

  const [diffVisible, setDiffVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);

  if (fetching || error || !data?.build) {
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

  const { branch, browsers, startedAt, tests } = data.build as StartedBuild;
  console.log(data.build);
  if (!tests) return null;

  const startedAgo = formatDistance(new Date(startedAt || 0), new Date(), {
    addSuffix: true,
  });

  const { changeCount, brokenCount, resultsByBrowser, resultsByViewport, viewportInfoById } = (
    tests.nodes || []
  ).reduce(
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
      viewportInfoById: {} as Record<
        string,
        StartedBuild["tests"]["nodes"][0]["parameters"]["viewport"]
      >,
    }
  );

  const test = tests.nodes?.find(({ result }) => result === TestResult.Changed) || tests.nodes?.[0];
  const isPending = test?.status === TestStatus.Pending;
  const isInProgress = tests.nodes?.some(({ status }) => status === TestStatus.InProgress);

  const browserCount = browsers.length;
  const browserInfoById = Object.fromEntries(browsers.map((browser) => [browser.id, browser]));
  const browserResults = Object.entries(resultsByBrowser).map(([id, result]) => ({
    browser: browserInfoById[id],
    result,
  }));

  const viewportCount = tests.nodes?.length;
  const viewportResults = Object.entries(resultsByViewport).map(([id, result]) => ({
    viewport: viewportInfoById[id],
    result,
  }));

  return (
    <Sections>
      <Section hidden={settingsVisible || warningsVisible}>
        <Row>
          <Col>
            <Text>
              {isInProgress && (
                <>
                  <b>Running tests...</b>
                  <ProgressIcon />
                </>
              )}
              {!isInProgress && isOutdated && (
                <>
                  <b>Snapshots outdated</b>
                  <AlertIcon />
                </>
              )}
              {!isInProgress && !isOutdated && (
                <>
                  <b>
                    {changeCount ? pluralize("change", changeCount, true) : "No changes"}
                    {brokenCount ? `, ${pluralize("error", brokenCount, true)}` : null}
                  </b>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  <StatusIcon icon={brokenCount ? "failed" : isPending ? "changed" : "passed"} />
                </>
              )}
              <br />
              {isOutdated ? (
                <small>
                  <span>Run tests to see what changed</span>
                </small>
              ) : (
                <small>
                  <span>
                    {pluralize("viewport", viewportCount, true)}
                    {", "}
                    {pluralize("browser", browserCount, true)}
                  </span>
                  {" • "}
                  {isInProgress ? (
                    <span>Test in progress...</span>
                  ) : (
                    <span title={new Date(startedAt).toUTCString()}>{startedAgo}</span>
                  )}
                </small>
              )}
            </Text>
          </Col>
          {isOutdated && (
            <Col push>
              <Button small secondary onClick={runDevBuild} disabled={isRunning}>
                {isRunning ? <ProgressIcon onButton /> : <Icon icon="play" />}
                Run tests
              </Button>
            </Col>
          )}
          {!isOutdated && changeCount > 0 && (
            <Col push>
              <Button small secondary={isPending} tertiary={!isPending}>
                {isPending ? "Verify changes" : "View changes"}
              </Button>
            </Col>
          )}
        </Row>
        {isInProgress ? (
          <Bar>
            <Placeholder />
            <Placeholder />
            <Placeholder width={50} marginLeft={-5} />
            <Placeholder />
          </Bar>
        ) : (
          <Bar>
            {!isOutdated && (
              <Col>
                <IconButton active={diffVisible} onClick={() => setDiffVisible(!diffVisible)}>
                  <Icon icon="contrast" />
                </IconButton>
              </Col>
            )}
            {viewportResults.length > 0 && (
              <Col>
                <ViewportSelector
                  viewportResults={viewportResults}
                  // eslint-disable-next-line no-console
                  onSelectViewport={console.log}
                />
              </Col>
            )}
            {browserResults.length > 0 && (
              <Col>
                <BrowserSelector
                  browserResults={browserResults}
                  // eslint-disable-next-line no-console
                  onSelectBrowser={console.log}
                />
              </Col>
            )}
            {changeCount > 0 && (
              <>
                <Col push>
                  <IconButton secondary>Accept</IconButton>
                </Col>
                <Col>
                  <IconButton secondary>
                    <Icon icon="batchaccept" />
                  </IconButton>
                </Col>
              </>
            )}
          </Bar>
        )}
      </Section>
      <Section grow hidden={settingsVisible || warningsVisible}>
        {isInProgress ? (
          <Loader />
        ) : (
          <SnapshotImage>
            <img src="/B.png" alt="" />
            {diffVisible && !isOutdated && <img src="/B-comparison.png" alt="" />}
          </SnapshotImage>
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
            <Text style={{ marginLeft: 5 }}>Latest snapshot on {branch}</Text>
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
