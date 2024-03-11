import { styled } from "@storybook/theming";

export const Text = styled.div<{ small?: boolean }>(({ small }) => ({
  fontSize: small ? 12 : 14,
  lineHeight: small ? "18px" : "20px",
  textAlign: "center",
  textWrap: "balance",
}));
