import { Button } from "@storybook/design-system";
import { background, styled } from "@storybook/theming";

export const BrowserButton = styled(Button)<{ active?: boolean }>((props) => ({
  "&&": {
    padding: 6,
    background: props.active ? background.hoverable : "transparent",

    "&:hover": {
      background: background.hoverable,
      boxShadow: "none",
    },

    "*": {
      opacity: props.active ? 1 : 0.5,
      transition: "opacity 0.2s ease-in-out",
    },
    "&:hover *": {
      opacity: 1,
    },
  },
}));
