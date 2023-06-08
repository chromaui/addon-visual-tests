import { background, styled } from "@storybook/theming";

export const Container = styled.div({
  background: background.app,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});
