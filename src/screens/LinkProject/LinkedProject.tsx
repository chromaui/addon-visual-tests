import { Icon } from "@storybook/design-system";
import React from "react";
import { useQuery } from "urql";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { graphql } from "../../gql";
import { ProjectQueryQuery } from "../../gql/graphql";

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
  goToNext,
  setAccessToken,
}: {
  projectId: string;
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
                <Icon icon="check" />
                <Heading>Project linked!</Heading>
                <p>
                  We added project ID to main.js. The {data.project.name} app ID will be used to
                  reference prior tests. Please commit this change to continue using this addon.
                </p>
                <Button secondary onClick={() => goToNext()}>
                  Next
                </Button>
                <p>
                  What is the app ID for?{" "}
                  <a href="https://www.chromatic.com/docs/cli">Learn More »</a>
                </p>
                {data?.project && (
                  <div>
                    <Heading>Selected project</Heading>
                    <Text>Baselines will be used with this project.</Text>
                    <b>
                      <a href={data.project.webUrl}>{data.project.name}</a>
                    </b>
                  </div>
                )}
                {data.project.lastBuild && (
                  <p>
                    Last build: {data.project.lastBuild.number} on branch{" "}
                    {data.project.lastBuild.branch}
                  </p>
                )}
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
      <Section>
        <Bar>
          <Col push />
          <Col>
            <FooterMenu setAccessToken={setAccessToken} />
          </Col>
        </Bar>
      </Section>
    </Sections>
  );
};
