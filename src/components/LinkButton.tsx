import { color, styled } from "@storybook/theming";

export const LinkButton = styled.button({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: "none",
  border: "none",
  color: color.mediumdark,
  margin: 0,
  padding: 0,
  cursor: "pointer",
  outline: "none",
  fontSize: "1em",

  "&:hover": {
    textDecoration: "underline",
  },
});
