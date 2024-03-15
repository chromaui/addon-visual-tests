import { IconButton as BaseIconButton } from "@storybook/components";
import { styled, type Theme } from "@storybook/theming";
import { ComponentProps } from "react";

const getStatusStyles = (theme: Theme, status?: IconButtonProps["status"]) =>
  (status &&
    {
      positive: { color: theme.color.positiveText },
      warning: { color: theme.color.warningText },
    }[status]) ||
  {};

interface IconButtonProps extends ComponentProps<typeof BaseIconButton> {
  active?: boolean;
  as?: string;
  secondary?: boolean;
  status?: "positive" | "warning";
}

export const IconButton: React.FC<IconButtonProps> = styled(BaseIconButton)<IconButtonProps>(
  ({ active, secondary, theme }) => ({
    display: "inline-flex",
    alignItems: "center",
    verticalAlign: "top",
    gap: 6,
    margin: 0,
    color: active || secondary ? theme.color.secondary : theme.color.mediumdark,
    fontWeight: "normal",
    "& > svg": {
      width: "auto",
    },
  }),
  ({ active, status, theme }) => !active && getStatusStyles(theme, status),
  ({ active, theme }) => {
    const isLightTheme = theme.background.content === theme.color.lightest;
    const activeBg = isLightTheme ? "rgb(241,248,255)" : "rgb(28,37,45)";
    const hoverBg = isLightTheme ? "rgb(229,243,255)" : "rgb(29,44,56)";
    return {
      "--bg-color": active ? activeBg : theme.background.content,
      "&:hover": {
        "--bg-color": hoverBg,
        color: theme.color.secondary,
      },
    };
  }
);
