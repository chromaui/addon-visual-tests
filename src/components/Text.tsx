import { styled } from "@storybook/theming";

export const Text = styled.div<{ center?: boolean; muted?: boolean; small?: boolean }>(
  ({ center, small, theme }) => ({
    display: "inline-block",
    color: theme.color.defaultText,
    fontSize: small ? theme.typography.size.s1 : theme.typography.size.s2,
    lineHeight: small ? "18px" : "20px",
    textAlign: center ? "center" : "left",
    textWrap: "balance",
  }),
  ({ muted, theme }) => muted && { color: theme.base === "light" ? theme.color.dark : "#C9CDCF" },
  ({ theme }) => ({
    b: {
      color: theme.color.defaultText,
    },
    code: {
      fontSize: theme.typography.size.s1,
      border: `1px solid ${theme.appBorderColor}`,
      borderRadius: 3,
      padding: 2,
    },
    small: {
      fontSize: theme.typography.size.s1,
    },
    span: {
      whiteSpace: "nowrap",
    },
    svg: {
      verticalAlign: "top",
    },
  })
);
