import React from "react";
import { dedent } from "ts-dedent";

import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { Section, Sections } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";

type LinkingProjectFailedProps = {
  projectId: string;
  configFile: string;
  setAccessToken: (accessToken: string | null) => void;
};

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
          <CenterText>
            <Heading>Add the Project ID to your Chromatic config</Heading>
            The <Code>projectId</Code> will be used to reference prior tests. Please commit this
            change to continue using this addon. The file should be saved at{" "}
            <Code>{configFile}</Code>.
          </CenterText>
          <Code>
            {dedent`
            {
              "projectId": "${projectId}",
            }
            `}
          </Code>
          <CenterText>
            <Link secondary withArrow target="_blank" href={configureDocsLink}>
              What&rsquo;s this for?
            </Link>
          </CenterText>
        </Container>
      </Section>
      <FooterSection setAccessToken={setAccessToken} />
    </Sections>
  );
}
