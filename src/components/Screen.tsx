import { styled } from "@storybook/theming";
import React, { ReactNode } from "react";

import { FooterMenu } from "./FooterMenu";
import { Col } from "./layout";

interface ScreenProps {
  children: ReactNode;
  footer?: ReactNode;
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const Content = styled.div(({ theme }) => ({
  background: theme.background.app,
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  height: "100%",
  overflowY: "auto",
}));

export const Footer = styled.div(({ theme }) => ({
  background: theme.background.bar,
  borderTop: `1px solid ${theme.appBorderColor}`,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  height: 39,
  flexShrink: 0,
  padding: "0 10px",
}));

export const Screen = ({
  children,
  footer = (
    <Footer>
      <Col push />
      <Col>
        <FooterMenu />
      </Col>
    </Footer>
  ),
}: ScreenProps) => {
  return (
    <Container>
      <Content>{children}</Content>
      {footer}
    </Container>
  );
};
