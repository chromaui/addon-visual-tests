import { Button as BaseButton } from "@storybook/design-system";
import { styled } from "@storybook/theming";

export const Button = styled(BaseButton)({
  "&&": {
    borderRadius: 4,
    fontSize: "13px",
    lineHeight: "14px",
    padding: "9px 12px",
  },
});
