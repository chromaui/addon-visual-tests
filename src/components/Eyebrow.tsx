import { styled } from "@storybook/theming";

export const Eyebrow = styled.div(({ theme }) => ({
  background: theme.background.app,
  padding: "10px 15px",
  lineHeight: "20px",
  color: theme.color.defaultText,
  borderBottom: `1px solid ${theme.appBorderColor}`,
}));
