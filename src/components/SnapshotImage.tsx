import { styled } from "@storybook/theming";

export const SnapshotImage = styled.div({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#fff",
  minHeight: 100,
  margin: 2,

  img: {
    maxWidth: "100%",
  },
  "img + img": {
    position: "absolute",
  },
});
