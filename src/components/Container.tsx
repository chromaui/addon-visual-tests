import { styled } from "@storybook/theming";

export const Container = styled.div(({ theme }) => ({
  background: theme.background.app,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
}));
