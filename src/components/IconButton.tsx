import { styled } from "@storybook/theming";

import { IconButton as BaseIconButton } from "@storybook/components";

export const IconButton = styled(BaseIconButton)<{ as?: string }>(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  margin: 0,
  color: `${theme.color.defaultText}99`,
  fontWeight: "normal",
  lineHeight: "18px",
}));
