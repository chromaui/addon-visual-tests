import { styled } from "@storybook/theming";

export const SnapshotImage = styled.div(({ theme }) => ({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "transparent",
  minHeight: 100,
  margin: 2,

  img: {
    maxWidth: "100%",
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
}));
