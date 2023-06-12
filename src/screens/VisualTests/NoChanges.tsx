import { Icon, TooltipLinkList, WithTooltip } from "@storybook/design-system";
import { color, styled } from "@storybook/theming";
import React from "react";

import { ChromeIcon } from "../../components/icons/ChromeIcon";
import { FirefoxIcon } from "../../components/icons/FirefoxIcon";
import { SafariIcon } from "../../components/icons/SafariIcon";
import { Col, Text, Row, Section, Sections } from "../../components/layout";
import { BrowserButton } from "../../components/BrowserButton";

const PassedIcon = styled(Icon)({
  color: color.positive,
  width: 12,
  height: 12,
});

const ArrowIcon = styled(Icon)({
  width: 10,
  height: 10,
});

const SnapshotImage = styled.div({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#fff",
  minHeight: 100,
});

const ViewportSelector = () => (
  <WithTooltip
    trigger="click"
    placement="bottom"
    tooltip={<TooltipLinkList links={[{ title: "764px", onClick: () => {} }]} />}
  >
    <Text>
      <Icon icon="grow" />
      764px
      <ArrowIcon icon="arrowdown" />
    </Text>
  </WithTooltip>
);

const BrowserSelector = () => (
  <WithTooltip
    trigger="click"
    placement="bottom"
    tooltip={<TooltipLinkList links={[{ title: "Chrome", onClick: () => {} }]} />}
  >
    <Text>
      <ChromeIcon alt="Chrome" />
      <ArrowIcon icon="arrowdown" />
    </Text>
  </WithTooltip>
);

export const NoChanges = () => {
  return (
    <Sections>
      <Section>
        <Row>
          <Col>
            <Text>
              <b>No changes</b>
              <PassedIcon icon="passed" />
            </Text>
            <Text>
              <span>3 viewports, 3 browsers • Ran 1m ago</span>
            </Text>
          </Col>
          <Text>
            <Icon icon="info" />
          </Text>
        </Row>
        <Row>
          <Col>
            <Col>
              <ViewportSelector />
            </Col>
            <Col>
              <BrowserSelector />
            </Col>
          </Col>
        </Row>
      </Section>
      <Section style={{ flexGrow: 1 }}>
        <SnapshotImage>
          <img src="https://snapshots.chromatic.com/snapshots/635781f3500dd2c49e189caf-64832b8bd18ba5e2d1e3d32c/capture-16b798d6.png" />
        </SnapshotImage>
      </Section>
      <Section>
        <Row>
          <Col>
            <Text>No changes</Text>
          </Col>
        </Row>
      </Section>
    </Sections>
  );
};
