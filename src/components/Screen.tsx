import { CloseIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import pluralize from "pluralize";
import React, { ReactNode, useCallback, useState } from "react";

import { CONFIG_INFO, CONFIG_INFO_DISMISSED } from "../constants";
import { Configuration } from "../screens/VisualTests/Configuration";
import { useControlsDispatch, useControlsState } from "../screens/VisualTests/ControlsContext";
import { ConfigInfoPayload } from "../types";
import { useSharedState } from "../utils/useSharedState";
import { Link } from "./design-system";
import { FooterMenu } from "./FooterMenu";
import { IconButton } from "./IconButton";
import { Col, Section } from "./layout";

const Bar = styled.div(({ theme }) => ({
  borderBottom: `1px solid ${theme.appBorderColor}`,
  display: "flex",
  alignItems: "center",
  minHeight: 40,
  lineHeight: "20px",
  padding: "5px 15px",
}));

const WarningSection = styled(Section)(({ theme }) => ({
  background: theme.background.warning,
  color: theme.color.warningText,
}));

const InfoSection = styled(Section)(({ theme }) => ({
  background: theme.background.hoverable,
  color: theme.color.defaultText,
}));

interface ConfigSectionProps {
  hidden?: boolean;
  ignoreConfig?: boolean;
  ignoreSuggestions?: boolean;
  onOpen: (scrollTo?: keyof ConfigInfoPayload["configuration"]) => void;
}

export const ConfigSection = ({
  hidden,
  ignoreConfig,
  ignoreSuggestions,
  onOpen,
}: ConfigSectionProps) => {
  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const problems = Object.keys(configInfo?.problems || {});
  const suggestions = Object.keys(configInfo?.suggestions || {});

  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(CONFIG_INFO_DISMISSED));
  const onDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(CONFIG_INFO_DISMISSED, "true");
  }, []);

  const configLink = (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link isButton onClick={() => onOpen((problems[0] || suggestions[0]) as any)} withArrow>
      Show details
    </Link>
  );

  if (problems.length > 0 && !ignoreConfig)
    return (
      <WarningSection hidden={hidden}>
        <Bar>
          <Col>
            <span>
              Visual tests locked due to configuration {pluralize("problem", problems.length)}.{" "}
              {configLink}
            </span>
          </Col>
        </Bar>
      </WarningSection>
    );

  if (suggestions.length > 0 && !dismissed && !ignoreConfig && !ignoreSuggestions)
    return (
      <InfoSection hidden={hidden}>
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

interface ScreenProps {
  children: ReactNode;
  footer?: ReactNode;
  ignoreConfig?: boolean;
  ignoreSuggestions?: boolean;
}

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const Content = styled.div<{ hidden?: boolean }>(({ hidden, theme }) => ({
  background: theme.background.app,
  display: hidden ? "none" : "flex",
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
  ignoreConfig = false,
  ignoreSuggestions = !footer,
}: ScreenProps) => {
  const { configVisible } = useControlsState();
  const { toggleConfig } = useControlsDispatch();
  const openConfig = useCallback(
    (scrollTo) => {
      toggleConfig(true);
      if (scrollTo)
        setTimeout(() => {
          document
            .getElementById(`${scrollTo}-option`)
            ?.scrollIntoView({ behavior: "smooth", inline: "nearest" });
        }, 200);
    },
    [toggleConfig]
  );

  return (
    <Container>
      <ConfigSection
        onOpen={openConfig}
        hidden={configVisible}
        ignoreConfig={ignoreConfig}
        ignoreSuggestions={ignoreSuggestions}
      />
      <Content hidden={configVisible}>{children}</Content>
      <Content hidden={!configVisible}>
        <Configuration onClose={() => toggleConfig(false)} />
      </Content>
      {footer}
    </Container>
  );
};
