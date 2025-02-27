import React, { ReactNode } from 'react';

import { FooterMenu } from './FooterMenu';
import { Bar, Col, Section } from './layout';

export const FooterSection = ({
  setAccessToken,
  render,
}: {
  setAccessToken: (accessToken: string | null) => void;
  render?: ({ menu }: { menu: ReactNode }) => ReactNode;
}) => {
  const menu = <FooterMenu />;
  return (
    <Section>
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
