import { color, styled } from "@storybook/theming";
import { Link } from "@storybook/design-system";
import React from "react";

const OpaqueLink = styled(Link)`
  font-size: 13px;
  line-height: 18px;
  color: ${color.mediumdark} !important;

  position: absolute;
  top: 10px;
  left: 10px;
`;

export const BackButton = ({ onClick, children }: any) => (
  <OpaqueLink isButton onClick={onClick}>
    {children}
  </OpaqueLink>
);
