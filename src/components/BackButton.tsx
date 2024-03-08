import { styled } from "@storybook/theming";
import React from "react";

import { Link } from "./design-system";

const OpaqueLink = styled(Link)({
  "&&": {
    fontSize: 14,
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
