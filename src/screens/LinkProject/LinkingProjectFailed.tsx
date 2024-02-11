import { Code, Link } from "@storybook/components";
import React from "react";
import { dedent } from "ts-dedent";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Text as CenterText } from "../../components/Text";

type LinkingProjectFailedProps = {
  projectId: string;
  configFile: string;
};

const configureDocsLink = "https://www.chromatic.com/docs/visual-tests-addon/#configure";

export function LinkingProjectFailed({ projectId, configFile }: LinkingProjectFailedProps) {
  return (
    <Screen>
      <Container>
        <CenterText>
          <Heading>Add the Project ID to your Chromatic config</Heading>
          The <code>projectId</code> will be used to reference prior tests. Please commit this
          change to continue using this addon. The file should be saved at <code>{configFile}</code>
          .
        </CenterText>
        <div style={{ margin: -10 }}>
          <Code>
            {dedent`
            {
              "projectId": "${projectId}",
            }
            `}
          </Code>
        </div>
        <CenterText>
          What is this for?{" "}
          <Link withArrow target="_blank" href={configureDocsLink}>
            Learn more
          </Link>
        </CenterText>
      </Container>
    </Screen>
  );
}
