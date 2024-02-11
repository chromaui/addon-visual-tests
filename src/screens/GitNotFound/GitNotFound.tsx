import { Code } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

import { Container } from "../../components/Container";
import { Icon, Link } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Section } from "../../components/layout";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { useUninstallAddon } from "../Uninstalled/UninstallContext";

interface GitNotFoundProps {
  gitInfoError: Error;
}

const InfoSection = styled(Section)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  borderRadius: theme.appBorderRadius,
  background: theme.base === "dark" ? theme.color.darker : theme.color.lightest,
  padding: 15,
  flex: 1,
  boxShadow: `0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 2px 5px 0px rgba(0, 0, 0, 0.05)`,
  maxWidth: "500px",
}));

const InfoSectionText = styled(Text)(({ theme }) => ({
  marginLeft: 14,
  flex: 1,
  textAlign: "left",
  color: theme.base === "dark" ? theme.color.lighter : theme.color.darker,
}));

const StyledCode = styled(Code)(({ theme }) => ({
  color: theme.base === "dark" ? theme.color.lighter : theme.color.darker,
  border: `1px solid ${theme.base === "dark" ? theme.color.mediumdark : "#ECF4F9"}`,
  backgroundColor: theme.base === "dark" ? theme.color.dark : "#F7FAFC",
  fontSize: "12px",
}));

export const GitNotFound = ({ gitInfoError }: GitNotFoundProps) => {
  const { uninstallAddon } = useUninstallAddon();
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <VisualTestsIcon />
            <Heading>Visual tests</Heading>
            <Text>
              Catch bugs in UI appearance automatically. Compare image snapshots to detect visual
              changes.
            </Text>
          </div>
          <InfoSection>
            <Icon icon="lock" />
            <InfoSectionText>
              <b>Git not detected</b>
              <br />
              This addon requires Git to associate test results with commits and branches.
              Initialize git (<StyledCode>git init</StyledCode>) and make your first commit (
              <StyledCode>git commit -m</StyledCode>) to get started!
            </InfoSectionText>
          </InfoSection>
          <Link
            target="_blank"
            href="https://www.chromatic.com/docs/visual-testing-addon/"
            withArrow
          >
            Visual tests requirements
          </Link>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link withArrow onClick={() => uninstallAddon()}>
            Uninstall
          </Link>
        </Stack>
      </Container>
    </Screen>
  );
};
