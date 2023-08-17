import { Badge as BaseBadge } from "@storybook/components";
import { styled } from "@storybook/theming";
import { ReactNode } from "react";

// NOTE: The `Badge` exported by `@storybook/components` incorrectly isn't typed to accept children
export const Badge = styled(BaseBadge)<{ children?: ReactNode }>({
  padding: "4px 8px",
  margin: "0 6px",
});
