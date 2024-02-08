import { styled } from "@storybook/theming";
import React from "react";
import { dedent } from "ts-dedent";

import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { Section, Sections } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text as CenterText } from "../../components/Text";

type LinkingProjectFailedProps = {
  projectId: string;
  configFile: string;
  setAccessToken: (accessToken: string | null) => void;
};

const CodeWrapper = styled.div(({ theme }) => ({
  "&& > *": {
    margin: 0, // override inherited component styles from SB
  },
  "&& pre": {
    color: theme.base === "dark" ? theme.color.lighter : theme.color.darker,
    background: theme.base === "dark" ? theme.color.darkest : theme.color.lightest,
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "left",
    padding: "15px !important",
  },
}));

const configureDocsLink = "https://www.chromatic.com/docs/addon-visual-tests#configure";

export function LinkingProjectFailed({
  projectId,
  configFile,
  setAccessToken,
}: LinkingProjectFailedProps) {
  return (
    <Sections>
      <Section grow>
        <Container>
          <Stack>
            <div>
              <Heading>Add the project ID to your Chromatic config</Heading>
              <CenterText>
                The <Code>projectId</Code> will be used to reference prior tests. Please commit this
                change to continue using this addon. The file should be saved at {configFile}.
              </CenterText>
            </div>
            <CodeWrapper>
              <Code>
                {dedent`
                {
                  "projectId": "${projectId}",
                }
              `}
              </Code>
            </CodeWrapper>
            <Link secondary withArrow target="_blank" href={configureDocsLink}>
              What&rsquo;s this for?
            </Link>
          </Stack>
        </Container>
      </Section>
      <FooterSection setAccessToken={setAccessToken} />
    </Sections>
  );
}
