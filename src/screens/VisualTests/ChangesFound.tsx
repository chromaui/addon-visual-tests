import { Icon, TooltipLinkList, WithTooltip } from "@storybook/design-system";
import { color, styled } from "@storybook/theming";
import React from "react";

import { ChromeIcon } from "../../components/icons/ChromeIcon";
import { Col, Text, Row, Section, Sections, Bar, Label } from "../../components/layout";
import { Button } from "../../components/Button";
import { StatusDot } from "../../components/StatusDot";
import { IconButton } from "../../components/IconButton";

const StatusIcon = styled(Icon)<{ icon: "passed" | "changed" | "failed" }>((props) => ({
  width: 12,
  height: 12,
  margin: "3px 6px",
  verticalAlign: "top",

  color: {
    passed: color.positive,
    changed: color.warning,
    failed: color.negative,
  }[props.icon],
}));

const ArrowIcon = styled(Icon)({
  width: 10,
  height: 10,
});

const SnapshotImage = styled.div({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#fff",
  height: "100%",
});

const ViewportSelector = () => (
  <WithTooltip
    trigger="click"
    placement="bottom"
    tooltip={<TooltipLinkList links={[{ title: "764px", onClick: () => {} }]} />}
  >
    <IconButton as="div">
      <StatusDot>
        <Icon icon="grow" />
      </StatusDot>
      764px
      <ArrowIcon icon="arrowdown" />
    </IconButton>
  </WithTooltip>
);

const BrowserSelector = () => (
  <WithTooltip
    trigger="click"
    placement="bottom"
    tooltip={<TooltipLinkList links={[{ title: "Chrome", onClick: () => {} }]} />}
  >
    <IconButton as="div">
      <StatusDot>
        <ChromeIcon alt="Chrome" />
      </StatusDot>
      <ArrowIcon icon="arrowdown" />
    </IconButton>
  </WithTooltip>
);

export const ChangesFound = () => {
  return (
    <Sections>
      <Section>
        <Row>
          <Col>
            <Text>
              <b>3 changes</b>
              <StatusIcon icon="changed" />
              <br />
              <small>3 viewports, 3 browsers • Ran 1m ago</small>
            </Text>
          </Col>
          <Col push>
            <Button secondary small>
              Verify changes
            </Button>
          </Col>
        </Row>
        <Bar>
          <Col>
            <IconButton active>
              <Icon icon="contrast" />
            </IconButton>
          </Col>
          <Col>
            <ViewportSelector />
          </Col>
          <Col>
            <BrowserSelector />
          </Col>
          <Col push>
            <IconButton secondary>Accept</IconButton>
          </Col>
          <Col>
            <IconButton secondary>
              <Icon icon="batchaccept" />
            </IconButton>
          </Col>
        </Bar>
      </Section>
      <Section style={{ flexGrow: 1 }}>
        <SnapshotImage>
          <img src="https://snapshots.chromatic.com/snapshots/635781f3500dd2c49e189caf-64832b8bd18ba5e2d1e3d32c/capture-16b798d6.png" />
        </SnapshotImage>
      </Section>
      <Section>
        <Bar>
          <Col>
            <Text style={{ marginLeft: 5 }}>Latest snapshot on feature-branch</Text>
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
        </Bar>
      </Section>
    </Sections>
  );
};
