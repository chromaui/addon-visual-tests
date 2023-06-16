import { Icon } from "@storybook/design-system";
import { formatDistance } from "date-fns";
import pluralize from "pluralize";
import React, { useState } from "react";

import { Button } from "../../components/Button";
import { Col, Text, Row, Section, Sections, Bar } from "../../components/layout";
import { IconButton } from "../../components/IconButton";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { ViewportSelector } from "../../components/ViewportSelector";
import { BrowserSelector } from "../../components/BrowserSelector";
import { SnapshotImage } from "../../components/SnapshotImage";
import { TooltipMenu } from "../../components/TooltipMenu";
import { BuildStatus, ComparisonResult, TestStatus, aggregate } from "../../constants";
import { useAccessToken } from "../../utils/graphQLClient";

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

  const { branch, changeCount, status, startedAt, tests } = build;
  const startedAgo = formatDistance(startedAt, new Date(), { addSuffix: true });

  const viewportStatuses = Object.fromEntries(
    tests?.map((test) => [test.comparisons[0].viewport, test.status]) || []
  );
  const browserResults = tests?.reduce((acc, test) => {
    test.comparisons.forEach((comparison) => {
      acc[comparison.browser] = aggregate<ComparisonResult>([
        comparison.result,
        acc[comparison.browser],
      ]);
    });
    return acc;
  }, {} as Record<string, ComparisonResult>);

  return (
    <Sections>
      <Section>
        <Row>
          <Col>
            <Text>
              <b>{changeCount ? pluralize("change", changeCount, true) : "No changes"}</b>
              <StatusIcon status={status} />
              <br />
              <small>
                <span>
                  {pluralize("viewport", Object.keys(viewportStatuses).length, true)},{" "}
                  {pluralize("browser", Object.keys(browserResults).length, true)}
                </span>{" "}
                • <span title={startedAt.toUTCString()}>Ran {startedAgo}</span>
              </small>
            </Text>
          </Col>
          {status === TestStatus.PENDING && (
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
            <ViewportSelector viewportStatuses={viewportStatuses} onSelectViewport={console.log} />
          </Col>
          <Col>
            <BrowserSelector browserResults={browserResults} onSelectBrowser={console.log} />
          </Col>
          {status === TestStatus.PENDING && (
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
      <Section style={{ flexGrow: 1 }}>
        <SnapshotImage>
          <img src="/B.png" />
          {diffVisible && <img src="/B-comparison.png" />}
        </SnapshotImage>
      </Section>
      <Section>
        <Bar>
          <Col>
            <Text style={{ marginLeft: 5 }}>Latest snapshot on {branch}</Text>
          </Col>
          <Col push>
            <IconButton>
              <Icon icon="controls" />
            </IconButton>
          </Col>
          <Col>
            <IconButton status="warning">
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
