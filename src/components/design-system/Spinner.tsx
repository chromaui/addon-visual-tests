import { styled } from "storybook/internal/theming";
import React, { ComponentProps, FunctionComponent } from "react";

import { rotate360 } from "./shared/animation";
import { color } from "./shared/styles";

interface Props {
  inline?: boolean;
  inverse?: boolean;
  inForm?: boolean;
  positive?: boolean;
  negative?: boolean;
  neutral?: boolean;
}

const SpinnerWrapper = styled.div<Props>(
  {
    borderRadius: "3em",
    cursor: "progress",
    display: "inline-block",
    overflow: "hidden",
    position: ["relative", "absolute"],
    transition: "all 200ms ease-out",
    verticalAlign: "top",
    top: "50%",
    left: "50%",
    marginTop: -16,
    marginLeft: -16,
    height: 32,
    width: 32,

    animation: `${rotate360} 0.7s linear infinite`,

    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0.03)",
    borderTopColor: "rgba(0, 0, 0, 0.15)",
  },
  (props) => ({
    ...(props.inverse && {
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderTopColor: "rgba(255, 255, 255, 0.4)",
    }),

    ...(props.inForm && {
      marginTop: -6,
      marginLeft: -6,
      height: 12,
      width: 12,
      border: `1px solid ${color.secondary}`,
      borderBottomColor: "transparent",
    }),

    ...(props.inline && {
      position: "relative",
      top: "initial",
      left: "initial",
      marginTop: "initial",
      marginLeft: "initial",
      verticalAlign: "middle",
      height: 8,
      width: 8,
      border: "1px solid",
      borderTopColor: color.secondary,
      borderLeftColor: color.secondary,
      borderRightColor: color.secondary,
      borderBottomColor: "transparent",

      ...(props.positive && {
        borderTopColor: color.positive,
        borderLeftColor: color.positive,
        borderRightColor: color.positive,
      }),

      ...(props.negative && {
        borderTopColor: color.red,
        borderLeftColor: color.red,
        borderRightColor: color.red,
      }),

      ...(props.neutral && {
        borderTopColor: color.dark,
        borderLeftColor: color.dark,
        borderRightColor: color.dark,
      }),

      ...(props.inverse && {
        borderTopColor: color.lightest,
        borderLeftColor: color.lightest,
        borderRightColor: color.lightest,
      }),
    }),
  })
);

export const Spinner: FunctionComponent<Props & ComponentProps<typeof SpinnerWrapper>> = (
  props
) => {
  return (
    <SpinnerWrapper
      aria-label="Content is loading ..."
      aria-live="polite"
      role="status"
      {...props}
    />
  );
};
