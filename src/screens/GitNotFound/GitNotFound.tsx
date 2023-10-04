import { Icon, Link } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React from "react";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Section } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

interface GitNotFoundProps {
  gitInfoError: Error;
}

const InfoSection = styled(Section)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  borderRadius: theme.appBorderRadius,
  background: theme.color.lightest,
  padding: 15,
  flex: 1,
  boxShadow: `0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 2px 5px 0px rgba(0, 0, 0, 0.05)`,
}));

const InfoSectionText = styled(Text)(({ theme }) => ({
  marginLeft: 14,
  flex: 1,
  textAlign: "left",
  color: theme.color.darker,
}));

export const GitNotFound = ({ gitInfoError }: GitNotFoundProps) => (
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
        </InfoSectionText>
      </InfoSection>
      <Link target="_new" href="https://www.chromatic.com/docs/cli/" withArrow>
        Visual tests requirements
      </Link>
    </Stack>
  </Container>
);
