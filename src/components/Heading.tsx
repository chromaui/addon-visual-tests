import { styled } from "@storybook/theming";

export const Heading = styled.h1(({ theme }) => ({
  margin: 0,
  fontSize: "1em",
  fontWeight: "bold",
  color: theme.base === "light" ? theme.color.defaultText : theme.color.lightest,
}));
