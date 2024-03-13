import { TooltipNote as OriginalTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";

export const Tooltip = styled(OriginalTooltip)(({ theme }) => ({
  marginBottom: "-4px",
  marginTop: "-4px",
}));
