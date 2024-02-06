import { Code as SBCode } from "@storybook/components";
import { styled } from "@storybook/theming";

export const Code = styled(SBCode)(({ theme }) => ({
  color: theme.base === "dark" ? theme.color.lighter : theme.color.darker,
  border: `1px solid ${theme.base === "dark" ? theme.color.mediumdark : "#ECF4F9"}`,
  backgroundColor: theme.base === "dark" ? theme.color.dark : "#F7FAFC",
  fontSize: "12px",
}));
