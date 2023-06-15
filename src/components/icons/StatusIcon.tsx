import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React from "react";

import { TestStatus } from "../../types";

const StyledIcon = styled(Icon)<{ icon: "passed" | "changed" | "failed" }>(({ icon, theme }) => ({
  width: 12,
  height: 12,
  margin: "3px 6px",
  verticalAlign: "top",

  color: {
    passed: theme.color.positive,
    changed: theme.color.warning,
    failed: theme.color.negative,
  }[icon],
}));

export const StatusIcon = ({ status }: { status: TestStatus }) =>
  ({
    "in-progress": null,
    passed: <StyledIcon icon="passed" />,
    pending: <StyledIcon icon="changed" />,
    accepted: <StyledIcon icon="passed" />,
    failed: <StyledIcon icon="failed" />,
  }[status]);
