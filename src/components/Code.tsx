import { Code as SBCode } from "storybook/internal/components";
import { styled } from "storybook/internal/theming";

export const Code = styled(SBCode)(({ theme }) => ({
  color: theme.base === "light" ? theme.color.darker : theme.color.lighter,
  border: `1px solid ${theme.appBorderColor}`,
  fontSize: "12px",
  padding: "2px 3px",
}));
