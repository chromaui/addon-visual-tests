import { Code, Link } from "@storybook/components";
import React from "react";
import { dedent } from "ts-dedent";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Section, Sections, Text } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";

type LinkingProjectFailedProps = {
  projectId: string;
  projectToken: string;
  configDir: string;
};

const addonName = "@chromaui/addon-visual-tests";
const configureDocsLink = "https://www.chromatic.com/docs/addon-visual-tests#configure";

export function LinkingProjectFailed({
  projectId,
  projectToken,
  configDir,
}: LinkingProjectFailedProps) {
  return (
    <Sections>
      <Section grow>
        <Container>
          <CenterText>
            <Heading>Add the Project ID to your Storybook config</Heading>
            The Project ID will be used to reference prior tests. Please commit this change to
            continue using this addon.
          </CenterText>
          <Code>
            {dedent`
            // ${configDir}/main.js|ts|tsx

            module.exports = {
              // ...,
              addons: [
                // ...
                {
                  name: '${addonName}',
                  options: {
                    projectId: '${projectId}',
                    projectToken: '${projectToken}',
                  },
                },
              ],
            };
            `}
          </Code>
          <CenterText>
            What is this for?{" "}
            <Link target="_new" href={configureDocsLink}>
              Learn more ≫
            </Link>
          </CenterText>
        </Container>
      </Section>
    </Sections>
  );
}
