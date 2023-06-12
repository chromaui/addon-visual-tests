import { styled } from "@storybook/theming";

export const StatusDot = styled.div<{ status?: "passed" | "changed" | "failed" }>(({ theme }) => ({
  display: "inline-block",
  position: "relative",
  height: "1em",

  "img, svg": {
    verticalAlign: "top",
  },

  "&&::after": {
    position: "absolute",
    top: -1,
    right: -2,
    content: '""',
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: theme.color.gold,
    border: `1px solid rgba(0, 0, 0, 0.1)`,
    boxShadow: `0 0 0 2px ${theme.background.content}`,
    boxSizing: "border-box",
  },
}));
