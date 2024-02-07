import { CloseIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import pluralize from "pluralize";
import React, { ReactNode, useCallback, useState } from "react";

import { CONFIG_INFO, CONFIG_INFO_DISMISSED } from "../constants";
import { ConfigInfoPayload } from "../types";
import { useSharedState } from "../utils/useSharedState";
import { Link } from "./design-system";
import { FooterMenu } from "./FooterMenu";
import { IconButton } from "./IconButton";
import { Bar, Col, Section } from "./layout";

const WarningSection = styled(Section)(({ theme }) => ({
  background: theme.background.warning,
  color: theme.color.warningText,
  paddingLeft: 5,
}));

const InfoSection = styled(Section)(({ theme }) => ({
  background: theme.background.hoverable,
  color: theme.color.defaultText,
  paddingLeft: 5,
}));

export const ConfigSection = () => {
  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const problems = Object.keys(configInfo?.problems || {}).length;
  const suggestions = Object.keys(configInfo?.suggestions || {}).length;

  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(CONFIG_INFO_DISMISSED));
  const onDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(CONFIG_INFO_DISMISSED, "true");
  }, []);

  const configLink = (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link isButton onClick={() => {}} withArrow>
      Show details
    </Link>
  );

  if (problems > 0)
    return (
      <WarningSection>
        <Bar>
          <Col>
            <span>
              Builds locked due to configuration {pluralize("problem", problems)}. {configLink}
            </span>
          </Col>
        </Bar>
      </WarningSection>
    );

  if (suggestions > 0 && !dismissed)
    return (
      <InfoSection>
        <Bar>
          <Col>
            <span>Configuration could be improved. {configLink}</span>
          </Col>
          <Col push>
            <IconButton onClick={onDismiss}>
              <CloseIcon />
            </IconButton>
          </Col>
        </Bar>
      </InfoSection>
    );

  return null;
};

export const FooterSection = ({
  setAccessToken,
  render,
}: {
  setAccessToken: (accessToken: string | null) => void;
  render?: ({ menu }: { menu: ReactNode }) => ReactNode;
}) => {
  const menu = <FooterMenu setAccessToken={setAccessToken} />;
  return (
    <>
      <ConfigSection />
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
    </>
  );
};
