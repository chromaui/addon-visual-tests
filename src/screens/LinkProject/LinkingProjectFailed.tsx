import { styled } from "@storybook/theming";
import React from "react";
import { dedent } from "ts-dedent";

import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

type LinkingProjectFailedProps = {
  projectId: string;
  configFile: string;
};

const CodeWrapper = styled.div(({ theme }) => ({
  "&& > *": {
    margin: 0, // override inherited component styles from SB
  },
  "&& pre": {
    color: theme.base === "light" ? theme.color.darker : theme.color.lighter,
    background: theme.base === "light" ? theme.color.lightest : theme.color.darkest,
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "left",
    padding: "15px !important",
  },
}));

const configureDocsLink = "https://www.chromatic.com/docs/visual-tests-addon/#configure";

export function LinkingProjectFailed({ projectId, configFile }: LinkingProjectFailedProps) {
  return (
    <Screen>
      <Container>
        <Stack>
          <div>
            <Heading>Add the project ID to your Chromatic config</Heading>
            <Text center muted>
              The <Code>projectId</Code> will be used to sync tests with Chromatic. Please commit
              this change to continue using the addon. The file should be saved at{" "}
              <Code>{configFile}</Code>.
            </Text>
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
    </Screen>
  );
}
