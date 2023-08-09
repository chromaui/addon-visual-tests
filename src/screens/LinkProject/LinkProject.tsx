import { Avatar, Icon, ListItem } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React, { useState } from "react";
import { useQuery } from "urql";

import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
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
  setAccessToken,
}: {
  onUpdateProject: (projectId: string, projectToken: string) => void;
  setAccessToken: (accessToken: string | null) => void;
}) => {
  const onSelectProjectId = React.useCallback(
    async (selectedProjectId: string, projectToken: string) => {
      await onUpdateProject(selectedProjectId, projectToken);
    },
    [onUpdateProject]
  );

  return <SelectProject onSelectProjectId={onSelectProjectId} setAccessToken={setAccessToken} />;
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
  display: flex;
  flex-direction: column;
`;
const Right = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.color.lighter};
  display: flex;
  flex-direction: column;
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
  margin: 10px;
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
  setAccessToken,
}: {
  onSelectProjectId: (projectId: string, projectToken: string) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
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

  React.useEffect(() => {
    if (data?.viewer?.accounts) {
      onSelectAccount(data.viewer.accounts[0]);
    }
  }, [data, onSelectAccount]);

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
    <Sections>
      {fetching && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
      {!fetching && data.viewer?.accounts && (
        <Section grow>
          <Container>
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
          </Container>
        </Section>
      )}
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
}
