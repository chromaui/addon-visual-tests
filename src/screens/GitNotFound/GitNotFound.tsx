import { styled } from "@storybook/theming";
import React from "react";

import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Icon, Link } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Section } from "../../components/layout";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { useUninstallAddon } from "../Uninstalled/UninstallContext";

const InfoSection = styled(Section)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  borderRadius: theme.appBorderRadius,
  background: theme.base === "light" ? theme.color.lightest : theme.color.darkest,
  border: `1px solid ${theme.appBorderColor}`,
  padding: 15,
  flex: 1,

  maxWidth: "500px",
}));

const InfoSectionText = styled(Text)(({ theme }) => ({
  marginLeft: 14,
  flex: 1,
  textAlign: "left",
  color: theme.base === "light" ? theme.color.darker : theme.color.lighter,
}));

const InfoSectionTextTitle = styled.b(() => ({
  display: "block",
  marginBottom: 2,
}));

export const GitNotFound = () => {
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
              <InfoSectionTextTitle>Git not detected</InfoSectionTextTitle>
              This addon requires Git to associate test results with commits and branches.
              <Code>git init</Code> and make your first commit
              <Code>git commit -m</Code> to get started!
            </InfoSectionText>
          </InfoSection>
          <Link
            target="_blank"
            href="https://www.chromatic.com/docs/visual-tests-addon#git-addon"
            withArrow
            secondary
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
