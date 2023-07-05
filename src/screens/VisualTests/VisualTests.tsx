import { Loader } from "@storybook/components";
import { Icon, Input } from "@storybook/design-system";
import { useTheme } from "@storybook/theming";
import { formatDistance } from "date-fns";
import pluralize from "pluralize";
import React, { ChangeEvent, useState } from "react";
import { useQuery } from "urql";

import { BrowserSelector } from "../../components/BrowserSelector";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { Bar, Col, Row, Section, Sections, Text } from "../../components/layout";
import { Placeholder } from "../../components/Placeholder";
import { SnapshotImage } from "../../components/SnapshotImage";
import { TooltipMenu } from "../../components/TooltipMenu";
import { ViewportSelector } from "../../components/ViewportSelector";
import { graphql } from "../../gql";
import { ComparisonResult, LastBuildQuery, TestResult, TestStatus } from "../../gql/graphql";
import { aggregateResult } from "../../utils/aggregateResult";
import { useProjectId } from "../../utils/useProjectId";
import { RenderSettings } from "./RenderSettings";
import { Warnings } from "./Warnings";

const QueryLastBuild = graphql(/* GraphQL */ `
  query LastBuild($projectId: ID!, $branch: String!, $storyId: String!) {
    project(id: $projectId) {
      id
      name
      webUrl
      lastBuild(branches: [$branch]) {
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
        ... on TestedBuild {
          changeCount: testCount(results: [ADDED, CHANGED, FIXED])
          startedAt
          tests(storyId: $storyId) {
            nodes {
              id
              result
              status
              comparisons {
                result
                browser {
                  id
                }
                viewport {
                  id
                }
              }
              parameters {
                viewport {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`);

interface VisualTestsProps {
  setAccessToken: (accessToken: string | null) => void;
}

export const VisualTests = ({ setAccessToken }: VisualTestsProps) => {
  const theme = useTheme();
  const [projectId, setProjectId, projectIdChanged] = useProjectId();

  const [{ data, fetching, error }, rerun] = useQuery<LastBuildQuery>({
    query: QueryLastBuild,
    variables: {
      projectId,
      branch: "test",
      storyId: "components-tile--donut",
    },
  });

  const [diffVisible, setDiffVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);

  // TODO: Remove the project input section of this, as project should always be defined.
  if (fetching || error || !data?.project) {
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
          {!fetching && !data?.project && (
            <Row>
              <Col>
                <Input
                  id="projectId"
                  label="Project ID"
                  value={projectId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    e.preventDefault();
                    setProjectId(e.target.value);
                  }}
                />
                <Button onClick={rerun}>Retry</Button>
              </Col>
            </Row>
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

  // If there is no lastBuild, show a prompt to run a build. This is a placeholder for now.
  if (!data.project.lastBuild) {
    return (
      <Sections>
        <Section grow>
          <Row>
            <Col>
              <Text>
                Your project {data.project.name} does not have any builds yet. Run a build a to begin.
              </Text>
            </Col>
          </Row>
        </Section>
      </Sections>
    );
  }

  // If there is a project selected and a build, show the visual tests.
  const { branch, browsers, startedAt, tests } = data?.project?.lastBuild;
  const startedAgo = formatDistance(new Date(startedAt), new Date(), { addSuffix: true });

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
        LastBuildQuery["project"]["lastBuild"]["tests"]["nodes"][0]["parameters"]["viewport"]
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
              {isInProgress ? (
                <>
                  <b>Running tests...</b>
                  <ProgressIcon />
                </>
              ) : (
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
            </Text>
          </Col>
          {changeCount > 0 && (
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
            <Col>
              <IconButton active={diffVisible} onClick={() => setDiffVisible(!diffVisible)}>
                <Icon icon="contrast" />
              </IconButton>
            </Col>
            {viewportResults.length > 0 && (
              <Col>
                <ViewportSelector
                  viewportResults={viewportResults}
                  onSelectViewport={console.log}
                />
              </Col>
            )}
            {browserResults.length > 0 && (
              <Col>
                <BrowserSelector browserResults={browserResults} onSelectBrowser={console.log} />
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
            {diffVisible && <img src="/B-comparison.png" alt="" />}
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
