import { CheckIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";
import { useQuery } from "urql";

import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { Col } from "../../components/layout";
import { Footer, Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { graphql } from "../../gql";
import { ProjectQueryQuery } from "../../gql/graphql";
import { useTelemetry } from "../../utils/TelemetryContext";

const Check = styled(CheckIcon)(({ theme }) => ({
  width: 40,
  height: 40,
  padding: 10,
  background: theme.color.positive,
  borderRadius: "100%",
  color: "white",
}));

const ButtonStackLink = styled(Link)(() => ({
  marginTop: 5,
}));

const ProjectQuery = graphql(/* GraphQL */ `
  query ProjectQuery($projectId: ID!) {
    project(id: $projectId) {
      id
      name
      webUrl
      lastBuild {
        branch
        number
      }
    }
  }
`);

export const LinkedProject = ({
  projectId,
  configFile,
  goToNext,
}: {
  projectId: string;
  configFile: string;
  goToNext: () => void;
}) => {
  useTelemetry("LinkProject", "LinkedProject");

  const [{ data, fetching, error }] = useQuery<ProjectQueryQuery>({
    query: ProjectQuery,
    variables: { projectId },
  });

  return (
    <Screen
      footer={
        <Footer>
          <Col>
            {data?.project?.lastBuild && (
              <Text style={{ marginLeft: 5 }}>
                Last build: {data.project.lastBuild.number} on branch{" "}
                {data.project.lastBuild.branch}
              </Text>
            )}
          </Col>
          <Col push>
            <FooterMenu />
          </Col>
        </Footer>
      }
    >
      <Container>
        <Stack>
          {fetching && <p>Loading...</p>}
          {error && <p>{error.message}</p>}
          {data?.project && (
            <>
              <Check />
              <div>
                <Heading>Project linked!</Heading>
                <Text center muted style={{ maxWidth: 500 }}>
                  The <Code>projectId</Code> for <strong>{data.project.name}</strong> was added in{" "}
                  <Code>{configFile}</Code> to sync tests with Chromatic. Please commit this change
                  to continue using this addon.
                </Text>
              </div>
              <ButtonStack>
                <Button variant="solid" size="medium" onClick={() => goToNext()}>
                  Catch a UI change
                </Button>
                <ButtonStackLink
                  href="https://www.chromatic.com/docs/cli"
                  target="_blank"
                  withArrow
                  secondary
                >
                  What&apos;s a project ID?
                </ButtonStackLink>
              </ButtonStack>
            </>
          )}
        </Stack>
      </Container>
    </Screen>
  );
};
