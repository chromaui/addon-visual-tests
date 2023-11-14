import { IconButton as BaseIconButton } from "@storybook/components";
import { styled } from "@storybook/theming";
import { ComponentProps } from "react";

interface IconButtonProps extends ComponentProps<typeof BaseIconButton> {
  active?: boolean;
  as?: string;
  secondary?: boolean;
  status?: "warning";
}

export const IconButton: React.FC<IconButtonProps> = styled(BaseIconButton)<IconButtonProps>(
  ({ active, secondary, theme }) => ({
    display: "inline-flex",
    alignItems: "center",
    verticalAlign: "top",
    gap: 6,
    margin: 0,
    color: active || secondary ? theme.color.secondary : `${theme.color.defaultText}99`,
    fontWeight: "normal",
    "& > svg": {
      width: "auto",
    },
  }),
  ({ active, status, theme }) => (!active && status ? { color: theme.color.warningText } : {}),
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
