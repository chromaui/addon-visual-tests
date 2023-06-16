import { css, styled } from "@storybook/theming";
import React from "react";

import { ComparisonResult, TestStatus } from "../constants";

interface StatusDotProps {
  status?: TestStatus | ComparisonResult;
}

const Dot = styled.div<StatusDotProps & { overlay?: boolean }>(
  ({ status, theme }) => ({
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: {
      [TestStatus.IN_PROGRESS]: "transparent",
      [TestStatus.PASSED]: theme.color.positive,
      [TestStatus.PENDING]: theme.color.gold,
      [TestStatus.ACCEPTED]: theme.color.positive,
      [TestStatus.DENIED]: theme.color.positive,
      [TestStatus.BROKEN]: theme.color.negative,
      [TestStatus.FAILED]: theme.color.negative,
      [ComparisonResult.EQUAL]: theme.color.positive,
      [ComparisonResult.FIXED]: theme.color.positive,
      [ComparisonResult.ADDED]: theme.color.gold,
      [ComparisonResult.CHANGED]: theme.color.gold,
      [ComparisonResult.REMOVED]: theme.color.gold,
      [ComparisonResult.CAPTURE_ERROR]: theme.color.negative,
      [ComparisonResult.SYSTEM_ERROR]: theme.color.negative,
    }[status],
  }),
  ({ overlay, theme }) =>
    overlay &&
    css({
      position: "absolute",
      top: -1,
      right: -2,
      width: 7,
      height: 7,
      border: `1px solid rgba(0, 0, 0, 0.1)`,
      boxShadow: `0 0 0 2px var(--bg-color, ${theme.background.content})`,
      boxSizing: "border-box",
    })
);

export const StatusDot = ({ status }: StatusDotProps) => <Dot status={status} />;

const Wrapper = styled.div({
  position: "relative",
  display: "inline-flex",
  justifyContent: "center",

  "img, svg": {
    verticalAlign: "top",
  },
});

export const StatusDotWrapper = ({
  status,
  children,
}: StatusDotProps & { children: React.ReactNode }) => (
  <Wrapper>
    {children}
    <Dot overlay status={status} />
  </Wrapper>
);
