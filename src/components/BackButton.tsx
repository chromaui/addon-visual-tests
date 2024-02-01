import { Link } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

const OpaqueLink = styled(Link)({
  "&&": {
    fontSize: "13px",
    lineHeight: "18px",
    position: "absolute",
    top: 10,
    left: 10,
  },
});

export const BackButton = ({ onClick, children }: any) => (
  <OpaqueLink secondary isButton onClick={onClick}>
    {children}
  </OpaqueLink>
);
