import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React from "react";

import { BuildStatus } from "../../constants";

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

export const StatusIcon = ({ status }: { status: BuildStatus }) =>
  ({
    [BuildStatus.IN_PROGRESS]: null,
    [BuildStatus.PASSED]: <StyledIcon icon="passed" />,
    [BuildStatus.PENDING]: <StyledIcon icon="changed" />,
    [BuildStatus.ACCEPTED]: <StyledIcon icon="passed" />,
    [BuildStatus.DENIED]: <StyledIcon icon="failed" />,
    [BuildStatus.BROKEN]: <StyledIcon icon="failed" />,
    [BuildStatus.FAILED]: <StyledIcon icon="failed" />,
    [BuildStatus.CANCELLED]: <StyledIcon icon="failed" />,
  }[status]);
