import { Code as SBCode } from "@storybook/components";
import { styled } from "@storybook/theming";

export const Code = styled(SBCode)(({ theme }) => ({
  color: theme.base === "dark" ? theme.color.lighter : theme.color.darker,
  border: `1px solid ${theme.color.border}`,
  backgroundColor: theme.color.border,
  fontSize: "12px",
  padding: "2px 3px",
}));
