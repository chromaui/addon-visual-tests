import { Button as BaseButton } from "@storybook/components";
import { css, styled } from "@storybook/theming";

export const Button = styled(BaseButton)<{ link?: boolean; tertiary?: boolean }>(
  {
    "&&": {
      display: "inline-flex",
      borderRadius: 4,
      fontSize: "13px",
      lineHeight: "14px",
      padding: "9px 12px",
      alignItems: "center",
      svg: {
        marginRight: 6,
      },
    },
  },
  ({ link, theme }) =>
    link &&
    css({
      "&&": {
        padding: 2,
        fontWeight: "normal",
        color: theme.color.defaultText,
        opacity: 0.5,
        "&:hover, &:focus": {
          opacity: 1,
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
    })
);
