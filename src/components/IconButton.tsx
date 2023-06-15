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
    "& > svg": {
      width: "auto",
    },
  }),
  ({ status, theme }) => (status ? { color: theme.color.warningText } : {}),
  ({ active, theme }) => {
    const isLightTheme = theme.background.content === theme.color.lightest;
    const activeBg = isLightTheme ? "rgb(241,248,255)" : "rgb(28,37,45)";
    const hoverBg = isLightTheme ? "rgb(229,243,255)" : "rgb(29,44,56)";
    return {
      "--bg-color": active ? activeBg : theme.background.content,
      "&:hover": { "--bg-color": hoverBg },
    };
  }
);
