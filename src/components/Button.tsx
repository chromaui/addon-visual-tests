import { Button as BaseButton } from "@storybook/components";
import { css, styled } from "@storybook/theming";

export const Button = styled(BaseButton)<{
  link?: boolean;
  tertiary?: boolean;
  belowText?: boolean;
}>(
  {
    "&&": {
      display: "inline-flex",
      borderRadius: 4,
      fontSize: "13px",
      lineHeight: "14px",
      padding: "9px 12px",
      alignItems: "center",
      "@container (min-width: 800px)": {
        padding: "8px 10px",
      },
      svg: {
        marginRight: 6,
      },
    },
  },
  ({ link, theme }) =>
    link &&
    css({
      "&&": {
        background: "none",
        boxShadow: "none",
        padding: 2,
        fontWeight: "normal",
        color: theme.color.defaultText,
        opacity: 0.5,
        transition: "opacity 150ms ease-out",
        "&:hover, &:focus": {
          opacity: 0.9,
        },
        "&:focus:not(:active)": {
          outline: `1px solid ${theme.color.secondary}`,
        },
      },
    }),
  ({ tertiary }) =>
    tertiary &&
    css({
      "&&:hover": { boxShadow: "none" },
    }),
  ({ belowText }) => belowText && { marginTop: 7 }
);
