import { styled } from "@storybook/theming";

export const Container = styled.div(({ theme }) => ({
  background: theme.background.app,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100%",
  padding: 10,
}));
