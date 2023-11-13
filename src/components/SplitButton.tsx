import { styled } from "@storybook/theming";
import { ComponentProps } from "react";

import { IconButton } from "./IconButton";

interface SplitButtonProps extends Omit<ComponentProps<typeof IconButton>, "secondary" | "status"> {
  side?: "left" | "right";
}

export const SplitButton: React.FC<SplitButtonProps> = styled(IconButton)<SplitButtonProps>(
  ({ theme }) => ({
    color: theme.color.lightest,
    backgroundColor: theme.color.secondary,
    fontWeight: 700,
    transition: "background-color 150ms",
    "--bg-color": theme.color.secondary,
    "&:hover": {
      color: theme.color.lightest,
      backgroundColor: "#028ce4",
      "--bg-color": theme.color.secondary,
    },
    "@container (min-width: 300px)": {
      height: 32,
      padding: 9,
    },
    "@container (min-width: 800px)": {
      height: 28,
      padding: 8,
    },
  }),
  ({ side }) => ({
    ...(side === "left" && { borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
    ...(side === "right" && { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }),
    ...(side === "right" && { borderLeft: `1px solid #41AAFD` }),
  })
);
