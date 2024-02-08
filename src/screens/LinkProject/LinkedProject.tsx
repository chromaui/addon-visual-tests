import { CheckIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";
import { useQuery } from "urql";

import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { Col, Section, Sections } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { graphql } from "../../gql";
import { ProjectQueryQuery } from "../../gql/graphql";

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
  setAccessToken,
}: {
  projectId: string;
  configFile: string;
  goToNext: () => void;
  setAccessToken: (accessToken: string | null) => void;
}) => {
  const [{ data, fetching, error }] = useQuery<ProjectQueryQuery>({
    query: ProjectQuery,
    variables: { projectId },
  });

  return (
    <Sections>
      <Section grow>
        <Container>
          <Stack>
            {fetching && <p>Loading...</p>}
            {error && <p>{error.message}</p>}
            {data?.project && (
              <Stack>
                <Check />
                <div>
                  <Heading>Project linked!</Heading>
                  <Text style={{ maxWidth: 500 }}>
                    <Code>projectId</Code> for {data.project.name} was added in {configFile} to sync
                    tests with Chromatic. Please commit this change to continue using this addon.
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
                    What&rsquo;s a project ID?
                  </ButtonStackLink>
                </ButtonStack>
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
      <FooterSection
        setAccessToken={setAccessToken}
        render={({ menu }) => (
          <>
            <Col>
              {data?.project?.lastBuild && (
                <Text style={{ marginLeft: 5 }}>
                  Last build: {data.project.lastBuild.number} on branch{" "}
                  {data.project.lastBuild.branch}
                </Text>
              )}
            </Col>
            <Col push>{menu}</Col>
          </>
        )}
      />
    </Sections>
  );
};
