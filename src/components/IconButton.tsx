import { styled } from "@storybook/theming";

import { IconButton as BaseIconButton } from "@storybook/components";

export const IconButton = styled(BaseIconButton)<{
  active?: boolean;
  as?: string;
  secondary?: boolean;
  status?: "warning";
}>(
  ({ active, secondary, theme }) => ({
    display: "inline-flex",
    alignItems: "center",
    verticalAlign: "top",
    gap: 6,
    margin: 0,
    color: active || secondary ? theme.color.secondary : `${theme.color.defaultText}99`,
    fontWeight: "normal",
    lineHeight: "18px",
  }),
  ({ status, theme }) => (status ? { color: theme.color.warningText } : {})
);
