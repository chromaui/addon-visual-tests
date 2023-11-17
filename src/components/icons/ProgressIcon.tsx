import { animation } from "@storybook/design-system";
import { css, styled } from "@storybook/theming";

const { rotate360 } = animation;

export const ProgressIcon = styled.div<{ parentComponent?: "Button" | "IconButton" }>(
  ({ theme }) => ({
    width: 12,
    height: 12,
    margin: "3px 6px",
    verticalAlign: "top",
    display: "inline-block",

    animation: `${rotate360} 0.7s linear infinite`,
    border: "2px solid transparent",
    borderLeftColor: theme.base === "dark" ? "#58faf9" : "#00aaff",
    borderBottomColor: "#25ccfd",
    borderRightColor: theme.base === "dark" ? "#00aaff" : "#58faf9",
    borderRadius: "100%",
    transform: "translate3d(0, 0, 0)",
  }),
  ({ parentComponent }) =>
    parentComponent &&
    css({
      margin: parentComponent === "IconButton" ? 1 : 0,
      borderWidth: 1,
      borderLeftColor: "currentcolor",
      borderBottomColor: "currentcolor",
      borderRightColor: "currentcolor",
    })
);
