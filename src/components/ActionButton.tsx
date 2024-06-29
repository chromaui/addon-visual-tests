import { styled, type Theme } from "@storybook/theming";
import { darken, lighten } from "polished";
import { ComponentProps } from "react";

import { IconButton } from "./IconButton";

const themeColors = ({ theme, status, variant }: { theme: Theme } & ActionButtonProps) => {
  if (variant === "outline") {
    return {
      color: theme.base === "light" ? theme.color.dark : theme.color.medium,
      backgroundColor: theme.background.app,
      borderColor: theme.base === "light" ? theme.color.medium : theme.color.darker,
      "&:hover": {
        color: theme.base === "light" ? theme.color.darkest : theme.color.lighter,
        backgroundColor: darken(0.03, theme.background.app),
      },
    };
  }
  if (status === "positive") {
    return {
      color: theme.color.positiveText,
      backgroundColor: theme.background.positive,
      borderColor: lighten(0.5, theme.color.positiveText),
      "&:hover": {
        color: theme.color.positiveText,
        backgroundColor: darken(0.05, theme.background.positive),
      },
    };
  }
  if (status === "warning") {
    return {
      color: theme.color.warningText,
      backgroundColor: theme.background.warning,
      borderColor: lighten(0.5, theme.color.warningText),
      "&:hover": {
        color: theme.color.warningText,
        backgroundColor: darken(0.05, theme.background.warning),
      },
    };
  }
  return {
    color: theme.color.lightest,
    backgroundColor: theme.color.secondary,
    borderWidth: 0,
    borderColor:
      theme.base === "light"
        ? lighten(0.2, theme.color.secondary)
        : darken(0.1, theme.color.secondary),
    "&:hover": {
      color: theme.color.lightest,
      backgroundColor: darken(0.05, theme.color.secondary),
    },
  };
};

interface ActionButtonProps extends ComponentProps<typeof IconButton> {
  square?: boolean;
  side?: "left" | "right";
}

export const ActionButton: React.FC<ActionButtonProps> = styled(IconButton)<ActionButtonProps>(
  ({ square }) => ({
    border: `1px solid transparent`,
    boxShadow: "none",
    fontSize: 12,
    fontWeight: 700,
    height: 28,
    padding: square ? "8px 6px" : 8,
    transition: "background-color 150ms ease-out",
    "@container (min-width: 300px)": {
      height: 32,
      width: square ? 32 : "auto",
      padding: square ? "9px 8px" : 9,
    },
    "@container (min-width: 800px)": {
      height: 28,
      fontSize: 12,
      width: square ? 28 : "auto",
      padding: square ? "8px 6px" : 8,
    },
  }),
  themeColors,
  ({ side }) => ({
    ...(side === "left" && {
      borderRightWidth: 1,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    }),
    ...(side === "right" && {
      borderLeftWidth: 0,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    }),
  })
);

export const ButtonGroup = styled.div({
  display: "flex",
  flexDirection: "row",
});
