import { Link } from "@storybook/design-system";
import { color, styled } from "@storybook/theming";
import React from "react";

const OpaqueLink = styled(Link)({
  "&&": {
    fontSize: "13px",
    lineHeight: "18px",
    color: color.mediumdark,
    position: "absolute",
    top: 10,
    left: 10,
  },
});

export const BackButton = ({ onClick, children }: any) => (
  <OpaqueLink isButton onClick={onClick}>
    {children}
  </OpaqueLink>
);
