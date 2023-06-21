import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";
// import React from "react";

// import { BuildStatus } from "../../gql/graphql";

export const StatusIcon = styled(Icon)<{ icon: "passed" | "changed" | "failed" }>(
  ({ icon, theme }) => ({
    width: 12,
    height: 12,
    margin: "3px 6px",
    verticalAlign: "top",

    color: {
      passed: theme.color.positive,
      changed: theme.color.warning,
      failed: theme.color.negative,
    }[icon],
  })
);

// export const StatusIcon = ({ status }: { status: BuildStatus }) =>
//   ({
//     [BuildStatus.Announced]: null,
//     [BuildStatus.Published]: null,
//     [BuildStatus.Prepared]: null,
//     [BuildStatus.InProgress]: null,
//     [BuildStatus.Passed]: <StyledIcon icon="passed" />,
//     [BuildStatus.Pending]: <StyledIcon icon="changed" />,
//     [BuildStatus.Accepted]: <StyledIcon icon="passed" />,
//     [BuildStatus.Denied]: <StyledIcon icon="failed" />,
//     [BuildStatus.Broken]: <StyledIcon icon="failed" />,
//     [BuildStatus.Failed]: <StyledIcon icon="failed" />,
//     [BuildStatus.Cancelled]: <StyledIcon icon="failed" />,
//   }[status]);
