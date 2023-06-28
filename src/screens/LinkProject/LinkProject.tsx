import { ListItem } from "@storybook/components";
import { set } from "date-fns";
import React, { useMemo, useState } from "react";
import { gql, useQuery } from "urql";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Row } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { graphql } from "../../gql";
import { ProjectQueryQuery, SelectProjectsQueryQuery } from "../../gql/graphql";
import { useProjectId } from "../../utils/useProjectId";

const SelectProjectsQuery = graphql(/* GraphQL */ `
  query SelectProjectsQuery {
    accounts {
      id
      name
      projects {
        id
        name
        webUrl
        lastBuild {
          branch
          number
        }
      }
    }
  }
`);

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

type LinkProjectScreen = "select" | "linked";
export const LinkProject = () => {
  const [screen, setScreen] = React.useState<LinkProjectScreen>("select");
  const [projectId, updateProjectId] = useProjectId();

  const onSelectProjectId = React.useCallback(
    (selectedProjectId: string) => {
      updateProjectId(selectedProjectId);
      setScreen("linked");
    },
    [updateProjectId, setScreen]
  );

  switch (screen) {
    case "select":
      return <SelectProject onSelectProject={onSelectProjectId} />;
    case "linked":
      return <LinkedProject projectId={projectId} />;
    default:
      return null;
  }
};

// default? 5fa3f227c1c504002259feba
function SelectProject({ onSelectProject }: { onSelectProject: (id: string) => void }) {
  const [selectedAccount, setSelectedAccount] =
    useState<SelectProjectsQueryQuery["accounts"][number]>(null);
  const [{ data, fetching, error }] = useQuery<SelectProjectsQueryQuery>({
    query: SelectProjectsQuery,
  });
  const onSelectAccount = React.useCallback(
    (account: SelectProjectsQueryQuery["accounts"][number]) => {
      setSelectedAccount(account);
    },
    [setSelectedAccount]
  );

  return (
    <Container>
      {fetching && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
      {!fetching && data.accounts && (
        <Row>
          <Stack>
            <Heading>Accounts</Heading>
            {data.accounts?.map((account) => (
              <ListItem
                key={account.id}
                title={account.name}
                onClick={() => onSelectAccount(account)}
              />
            ))}
          </Stack>
          <Stack>
            <Heading>Projects</Heading>
            {selectedAccount?.projects?.map((project) => (
              <ListItem key={project.id} onClick={() => onSelectProjectId(project.id)} å />
            ))}
          </Stack>
        </Row>
      )}
    </Container>
  );
}

export const LinkedProject = ({ projectId }: { projectId: string }) => {
  const [{ data, fetching, error }] = useQuery<ProjectQueryQuery>({
    query: ProjectQuery,
    variables: { projectId },
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
