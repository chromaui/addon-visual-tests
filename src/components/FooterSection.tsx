import React, { ReactNode } from "react";

import { FooterMenu } from "./FooterMenu";
import { Bar, Col, Section } from "./layout";

export const FooterSection = ({
  setAccessToken,
  render,
}: {
  setAccessToken: (accessToken: string | null) => void;
  render?: ({ menu }: { menu: ReactNode }) => ReactNode;
}) => {
  const menu = <FooterMenu setAccessToken={setAccessToken} />;
  return (
    <Section last>
      <Bar>
        {render ? (
          render({ menu })
        ) : (
          <>
            <Col push />
            <Col>{menu}</Col>
          </>
        )}
      </Bar>
    </Section>
  );
};
