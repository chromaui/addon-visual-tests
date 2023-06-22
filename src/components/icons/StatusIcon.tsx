import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";

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
