import { styled } from "@storybook/theming";
import React from "react";

import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Icon, Link } from "../../components/design-system";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Section, Sections } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

interface GitNotFoundProps {
  gitInfoError: Error;
  setAccessToken: (accessToken: string | null) => void;
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

export const GitNotFound = ({ gitInfoError, setAccessToken }: GitNotFoundProps) => {
  return (
    <Sections>
      <Section grow>
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
                Initialize git (<Code>git init</Code>) and make your first commit (
                <Code>git commit -m</Code>) to get started!
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
          </Stack>
        </Container>
      </Section>
      <FooterSection setAccessToken={setAccessToken} />
    </Sections>
  );
};
