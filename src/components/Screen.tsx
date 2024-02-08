import React, { ReactNode } from "react";

import { useAuthState } from "../AuthContext";
import { FooterSection } from "./FooterSection";
import { Sections } from "./layout";

interface ScreenProps {
  children: ReactNode;
  header?: () => ReactNode;
  footer?: ({ menu }: { menu: ReactNode }) => ReactNode;
}

export const Screen = ({ children, footer, header }: ScreenProps) => {
  const { setAccessToken } = useAuthState();
  return (
    <Sections>
      {header?.()}
      {children}
      <FooterSection render={footer} setAccessToken={setAccessToken} />
    </Sections>
  );
};
