import { Code as SBCode } from "@storybook/components";
import { styled } from "@storybook/theming";

export const Code = styled(SBCode)(({ theme }) => ({
  color: theme.base === "light" ? theme.color.darker : theme.color.lighter,
  border: `1px solid ${theme.base === "light" ? theme.color.border : theme.color.darker}`,
  fontSize: "12px",
  padding: "2px 3px",
}));
