import { Avatar, Icon, ListItem } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React, { useMemo, useState } from "react";
import { useQuery } from "urql";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Text } from "../../components/Text";
import { graphql } from "../../gql";
import { SelectProjectsQueryQuery } from "../../gql/graphql";

const SelectProjectsQuery = graphql(/* GraphQL */ `
  query SelectProjectsQuery {
    viewer {
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
  }
`);

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
    useState<SelectProjectsQueryQuery["viewer"]["accounts"][number]>(null);
  const [{ data, fetching, error }] = useQuery<SelectProjectsQueryQuery>({
    query: SelectProjectsQuery,
  });
  const onSelectAccount = React.useCallback(
    (account: SelectProjectsQueryQuery["viewer"]["accounts"][number]) => {
      setSelectedAccount(account);
    },
    [setSelectedAccount]
  );

  const [isSelectingProject, setSelectingProject] = useState(false);

  const handleSelectProject = React.useCallback(
    (project: SelectProjectsQueryQuery["viewer"]["accounts"][number]["projects"][number]) => {
      setSelectingProject(true);
      const { id: projectId, projectToken } = project;
      onSelectProjectId(projectId, projectToken);
      const timer = setTimeout(() => {
        setSelectingProject(false);
      }, 1000);
      return () => clearTimeout(timer);
    },
    [onSelectProjectId, setSelectingProject]
  );

  return (
    <Container>
      {fetching && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
      {!fetching && data.viewer?.accounts && (
        <>
          <Heading>Select a Project</Heading>
          <Text>Baselines will be used with this project.</Text>
          <ProjectPicker>
            <Left>
              <ListHeading>Accounts</ListHeading>
              <List>
                {data.viewer.accounts?.map((account) => (
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
                    disabled={isSelectingProject}
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
