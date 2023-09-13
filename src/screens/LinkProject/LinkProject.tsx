import { Icons } from "@storybook/components";
import { Avatar, Link, ListItem } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React, { useEffect, useState } from "react";
import { useQuery } from "urql";

import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { graphql } from "../../gql";
import { SelectProjectsQueryQuery } from "../../gql/graphql";
import { useChromaticDialog } from "../../utils/useChromaticDialog";

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
  chromaticBaseUrl,
}: {
  onUpdateProject: (projectId: string, projectToken: string) => void;
  setAccessToken: (accessToken: string | null) => void;
  chromaticBaseUrl: string;
}) => {
  const onSelectProjectId = React.useCallback(
    async (selectedProjectId: string, projectToken: string) => {
      await onUpdateProject(selectedProjectId, projectToken);
    },
    [onUpdateProject]
  );

  return (
    <SelectProject
      onSelectProjectId={onSelectProjectId}
      setAccessToken={setAccessToken}
      chromaticBaseUrl={chromaticBaseUrl}
    />
  );
};

const ListHeading = styled.div`
  font-size: ${({ theme }) => theme.typography.size.s1}px;
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.dark};
  background-color: inherit;
  padding: 9px 15px;
  border-bottom: 1px solid ${({ theme }) => theme.color.mediumlight};
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
  chromaticBaseUrl,
}: {
  onSelectProjectId: (projectId: string, projectToken: string) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
  chromaticBaseUrl: string;
}) {
  const [selectedAccount, setSelectedAccount] =
    useState<SelectProjectsQueryQuery["viewer"]["accounts"][number]>(null);
  const [{ data, fetching, error }, rerun] = useQuery<SelectProjectsQueryQuery>({
    query: SelectProjectsQuery,
  });
  console.log({ data, fetching, error });

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(rerun, 5000);
    return () => clearInterval(interval);
  }, [rerun]);

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

  const openChromatic = useChromaticDialog();
  // TODO: Make this available on the API https://github.com/chromaui/chromatic/pull/7714
  const newProjectUrl = `${chromaticBaseUrl}/apps?accountId=${selectedAccount?.id
    ?.split(":")
    ?.at(1)}`;

  return (
    <Sections>
      <Section grow>
        <Container>
          <Stack>
            {!data && fetching && <p>Loading...</p>}
            {error && <p>{error.message}</p>}
            {data?.viewer?.accounts && (
              <>
                <Heading>Select a Project</Heading>
                <Text>Baselines will be used with this project.</Text>
                <ProjectPicker>
                  <Left>
                    <ListHeading>Accounts</ListHeading>
                    <List data-testid="left-list">
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
                    <List data-testid="right-list">
                      {selectedAccount?.projects?.map((project) => (
                        <ListItem
                          appearance="secondary"
                          key={project.id}
                          title={project.name}
                          right={<Icons icon="add" aria-label={project.name} />}
                          onClick={() => handleSelectProject(project)}
                          disabled={isSelectingProject}
                        />
                      ))}
                      <ListItem
                        title={
                          // eslint-disable-next-line jsx-a11y/anchor-is-valid
                          <Link isButton withArrow onClick={() => openChromatic(newProjectUrl)}>
                            Create project
                          </Link>
                        }
                      />
                    </List>
                  </Right>
                </ProjectPicker>
              </>
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
}
