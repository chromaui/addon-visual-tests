import React from "react";
import { gql, useQuery } from "urql";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

const ProjectQuery = gql`
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
`;

export const Onboarding = () => {
  const [{ data, fetching, error }] = useQuery({
    query: ProjectQuery,
    variables: { projectId: "5fa3f227c1c504002259feba" },
  });

  return (
    <Container>
      <Stack>
        {fetching && <p>Loading...</p>}
        {error && <p>{error.message}</p>}
        {data?.project && (
          <div>
            <Heading>Selected project</Heading>
            <Text>Baselines will be used with this project.</Text>
            <b>
              <a href={data.project.webUrl}>{data.project.name}</a>
            </b>
            {data.project.lastBuild && (
              <p>
                Last build: {data.project.lastBuild.number} on branch{" "}
                {data.project.lastBuild.branch}
              </p>
            )}
          </div>
        )}
      </Stack>
    </Container>
  );
};
