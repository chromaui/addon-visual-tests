import { Icon } from "@storybook/design-system";
import { formatDistance } from "date-fns";
import pluralize from "pluralize";
import React, { useState } from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { Bar, Col, Row, Section, Sections, Text } from "../../components/layout";
import { SnapshotImage } from "../../components/SnapshotImage";
import { TooltipMenu } from "../../components/TooltipMenu";
import { ViewportSelector } from "../../components/ViewportSelector";
import { aggregate } from "../../constants";
import { BuildStatus, ComparisonResult, TestStatus } from "../../gql/graphql";
import { useAccessToken } from "../../utils/graphQLClient";
import { RenderSettings } from "./RenderSettings";
import { Warnings } from "./Warnings";

interface Test {
  id: string;
  status: TestStatus;
  comparisons: {
    browser: string;
    viewport: string;
    result: ComparisonResult;
  }[];
}

interface VisualTestsProps {
  build: {
    branch: string;
    changeCount?: number;
    status: BuildStatus;
    startedAt: Date;
    tests?: Test[];
  };
}

export const VisualTests = ({ build }: VisualTestsProps) => {
  const [, setAccessToken] = useAccessToken();
  const [diffVisible, setDiffVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);

  const { branch, changeCount, status, startedAt, tests } = build;
  const startedAgo = formatDistance(startedAt, new Date(), { addSuffix: true });

  const viewportResults = tests?.reduce((acc, test) => {
    test.comparisons.forEach((comparison) => {
      acc[comparison.viewport] = aggregate<ComparisonResult>([
        comparison.result,
        acc[comparison.viewport],
      ]);
    });
    return acc;
  }, {} as Record<string, ComparisonResult>);
  const browserResults = tests?.reduce((acc, test) => {
    test.comparisons.forEach((comparison) => {
      acc[comparison.browser] = aggregate<ComparisonResult>([
        comparison.result,
        acc[comparison.browser],
      ]);
    });
    return acc;
  }, {} as Record<string, ComparisonResult>);

  const test = tests?.[0];

  return (
    <>
      <Sections>
        <Section hidden={settingsVisible || warningsVisible}>
          <Row>
            <Col>
              <Text>
                <b>{changeCount ? pluralize("change", changeCount, true) : "No changes"}</b>
                <StatusIcon status={status} />
                <br />
                <small>
                  <span>
                    {pluralize("viewport", Object.keys(viewportResults).length, true)},{" "}
                    {pluralize("browser", Object.keys(browserResults).length, true)}
                  </span>{" "}
                  • <span title={startedAt.toUTCString()}>Ran {startedAgo}</span>
                </small>
              </Text>
            </Col>
            {test.status === TestStatus.Pending && (
              <Col push>
                <Button secondary small>
                  Verify changes
                </Button>
              </Col>
            )}
          </Row>
          <Bar>
            <Col>
              <IconButton active={diffVisible} onClick={() => setDiffVisible(!diffVisible)}>
                <Icon icon="contrast" />
              </IconButton>
            </Col>
            <Col>
              <ViewportSelector viewportResults={viewportResults} onSelectViewport={console.log} />
            </Col>
            <Col>
              <BrowserSelector browserResults={browserResults} onSelectBrowser={console.log} />
            </Col>
            {test.status === TestStatus.Pending && (
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
        </Section>
        <Section grow hidden={settingsVisible || warningsVisible}>
          <SnapshotImage>
            <img src="/B.png" alt="" />
            {diffVisible && <img src="/B-comparison.png" alt="" />}
          </SnapshotImage>
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
    </>
  );
};
