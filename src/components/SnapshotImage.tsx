import { styled } from "@storybook/theming";

export const SnapshotImage = styled.div<{ href?: string; target?: string }>(
  ({ theme }) => ({
    position: "relative",
    display: "grid",
    background: "transparent",
    minHeight: 100,
    margin: 2,
    overflow: "auto",

    img: {
      gridRow: 1,
      gridColumn: 1,
      transition: "filter 0.1s ease-in-out",
    },
    div: {
      color: theme.color.mediumdark,
      margin: "30px 15px",
      textAlign: "center",
      svg: {
        width: 28,
        height: 28,
      },
    },
  }),
  ({ href }) =>
    href && {
      "&:hover": {
        "& > svg": {
          opacity: 1,
        },
        img: {
          filter: "brightness(85%)",
        },
      },
    }
);
