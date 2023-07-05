import { Avatar, Icon, ListItem } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import { set } from "date-fns";
import React, { useMemo, useState } from "react";
import { gql, useQuery } from "urql";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Row } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { graphql } from "../../gql";
import { ProjectQueryQuery, SelectProjectsQueryQuery } from "../../gql/graphql";

const SelectProjectsQuery = graphql(/* GraphQL */ `
  query SelectProjectsQuery {
    accounts {
      id
      name
      avatarUrl
      projects {
        id
        name
        webUrl
        projectToken
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

export const LinkProject = ({
  onUpdateProject,
}: {
  onUpdateProject: (projectId: string, projectToken: string) => void;
}) => {
  const onSelectProjectId = React.useCallback(
    async (selectedProjectId: string, projectToken: string) => {
      await onUpdateProject(selectedProjectId, projectToken);
    },
    [onUpdateProject]
  );

  return <SelectProject onSelectProjectId={onSelectProjectId} />;
};

const ListHeading = styled.div`
  font-size: ${({ theme }) => theme.typography.size.s1}px;
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.dark};
  background-color: inherit;
  padding: 9px 15px;
  border-bottom: 1px solid ${({ theme }) => theme.color.mediumlight};
`;

const ListHeadingText = styled.h1`
  font-size: ${({ theme }) => theme.typography.size.l2} px;
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.mediumdark};
  background-color: inherit;
  padding: 9px 15px;
`;

const Left = styled.div`
  flex: 1;
  background-color: white;
`;
const Right = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.color.lighter};
`;

const ProjectPicker = styled.div`
  background: ${({ theme }) => theme.color.lightest};
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.color.mediumlight};
  height: 260px;
  width: 420px;
  overflow: hidden;
  text-align: left;
  position: relative;
  display: flex;
`;

const List = styled.div({
  height: "100%",
  overflowY: "auto",
});

const RepositoryOwnerAvatar = styled(Avatar)`
  margin-right: 10px;
`;

function SelectProject({
  onSelectProjectId,
}: {
  onSelectProjectId: (projectId: string, projectToken: string) => Promise<void>;
}) {
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

  const [isSelectingRepository, setSelectingRepository] = useState(false);

  const handleSelectProject = React.useCallback(
    (project: SelectProjectsQueryQuery["accounts"][number]["projects"][number]) => {
      setSelectingRepository(true);
      const { id: projectId, code: projectToken } = project;
      onSelectProjectId(projectId, projectToken);
      const timer = setTimeout(() => {
        console.log("resetting timer");
        setSelectingRepository(false);
      }, 5000);
      return () => clearTimeout(timer);
    },
    [onSelectProjectId, setSelectingRepository]
  );

  return (
    <Container>
      {fetching && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
      {!fetching && data?.accounts && (
        <>
          <Heading>Select a Project</Heading>
          <Text>Baselines will be used with this project.</Text>
          <ProjectPicker>
            <Left>
              <ListHeading>Accounts</ListHeading>
              <List>
                {data.accounts?.map((account) => (
                  <ListItem
                    key={account.id}
                    title={account.name}
                    left={<RepositoryOwnerAvatar src={account.avatarUrl} size="tiny" />}
                    onClick={() => onSelectAccount(account)}
                    active={selectedAccount?.id === account.id}
                  />
                ))}
              </List>
            </Left>
            <Right>
              <ListHeading>Projects</ListHeading>
              <List>
                {selectedAccount?.projects?.map((project) => (
                  <ListItem
                    appearance="secondary"
                    key={project.id}
                    title={project.name}
                    right={<Icon icon="add" aria-label={project.name} />}
                    onClick={() => handleSelectProject(project)}
                  />
                ))}
              </List>
            </Right>
          </ProjectPicker>
        </>
      )}
    </Container>
  );
}

export const LinkedProject = ({
  projectId,
  goToNext,
}: {
  projectId: string;
  goToNext: () => void;
}) => {
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
              What is the app ID for? <a href="https://www.chromatic.com/docs/cli">Learn More »</a>
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
        ;
      </Stack>
    </Container>
  );
};
