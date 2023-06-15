import { Icon } from "@storybook/design-system";
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
import { TestStatus } from "../../types";
import { useAccessToken } from "../../utils/graphQLClient";

interface VisualTestsProps {
  branch: string;
  status: TestStatus;
  changeCount?: number;
}

export const VisualTests = ({ branch, status, changeCount }: VisualTestsProps) => {
  const [, setAccessToken] = useAccessToken();
  const [diffVisible, setDiffVisible] = useState(true);

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
                <span>3 viewports, 3 browsers</span> • <span>Ran 1m ago</span>
              </small>
            </Text>
          </Col>
          {status === "pending" && (
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
            <ViewportSelector status={status} onSelectViewport={console.log} />
          </Col>
          <Col>
            <BrowserSelector status={status} onSelectBrowser={console.log} />
          </Col>
          {status === "pending" && (
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
