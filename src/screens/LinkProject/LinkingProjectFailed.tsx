import { Code, Link } from "@storybook/components";
import React from "react";
import { dedent } from "ts-dedent";

import { Container } from "../../components/Container";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { Section, Sections } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";

type LinkingProjectFailedProps = {
  projectId: string;
  projectToken: string;
  configFile: string;
  setAccessToken: (accessToken: string | null) => void;
};

const configureDocsLink = "https://www.chromatic.com/docs/addon-visual-tests#configure";

export function LinkingProjectFailed({
  projectId,
  projectToken,
  configFile,
  setAccessToken,
}: LinkingProjectFailedProps) {
  return (
    <Sections>
      <Section grow>
        <Container>
          <CenterText>
            <Heading>Add the Project ID to your Chromatic config</Heading>
            The <code>projectId</code> will be used to reference prior tests. Please commit this
            change to continue using this addon. The file should be saved at{" "}
            <code>{configFile}</code>.
          </CenterText>
          <Code>
            {dedent`
            {
              "projectId": "${projectId}",
              "projectToken": "${projectToken}",
            }
            `}
          </Code>
          <CenterText>
            What is this for?{" "}
            <Link withArrow target="_new" href={configureDocsLink}>
              Learn more
            </Link>
          </CenterText>
        </Container>
      </Section>
      <FooterSection setAccessToken={setAccessToken} />
    </Sections>
  );
}
