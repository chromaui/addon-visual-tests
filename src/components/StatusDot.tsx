import { css, styled } from "@storybook/theming";
import React from "react";

import { TestStatus } from "../types";

interface StatusDotProps {
  status?: TestStatus;
}

const Dot = styled.div<StatusDotProps & { overlay?: boolean }>(
  ({ status, theme }) => ({
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: {
      "in-progress": "transparent",
      passed: theme.color.positive,
      pending: theme.color.gold,
      accepted: theme.color.positive,
      failed: theme.color.negative,
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

const Wrapper = styled.div(({ theme }) => ({
  position: "relative",
  display: "inline-flex",
  justifyContent: "center",

  "img, svg": {
    verticalAlign: "top",
  },
}));

export const StatusDotWrapper = ({
  status,
  children,
}: StatusDotProps & { children: React.ReactNode }) =>
  status === "pending" ? (
    <Wrapper>
      {children}
      <Dot overlay status={status} />
    </Wrapper>
  ) : (
    <>{children}</>
  );
