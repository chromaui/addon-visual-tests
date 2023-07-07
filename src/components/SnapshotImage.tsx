import { styled } from "@storybook/theming";

export const SnapshotImage = styled.div<{ href?: string; target?: string }>(
  ({ theme }) => ({
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "transparent",
    minHeight: 100,
    margin: 2,

    img: {
      maxWidth: "100%",
      transition: "filter 0.1s ease-in-out",
    },
    "img + img": {
      position: "absolute",
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
    "& > svg": {
      position: "absolute",
      width: 28,
      height: 28,
      color: theme.color.lightest,
      opacity: 0,
      transition: "opacity 0.1s ease-in-out",
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
