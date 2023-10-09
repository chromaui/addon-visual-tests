import { Icons, Link } from "@storybook/components";
import { Avatar, ListItem } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "urql";

import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { graphql } from "../../gql";
import type { Account, Project, SelectProjectsQueryQuery } from "../../gql/graphql";
import { DialogHandler, useChromaticDialog } from "../../utils/useChromaticDialog";

const SelectProjectsQuery = graphql(/* GraphQL */ `
  query SelectProjectsQuery {
    viewer {
      accounts {
        id
        name
        avatarUrl
        newProjectUrl
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
  createdProjectId,
  setCreatedProjectId,
  onUpdateProject,
  setAccessToken,
}: {
  createdProjectId: Project["id"] | undefined;
  setCreatedProjectId: (projectId: Project["id"]) => void;
  onUpdateProject: (projectId: string, projectToken: string) => void;
  setAccessToken: (accessToken: string | null) => void;
}) => {
  const onSelectProjectId = React.useCallback(
    async (selectedProjectId: string, projectToken: string) => {
      await onUpdateProject(selectedProjectId, projectToken);
    },
    [onUpdateProject]
  );

  return (
    <SelectProject
      createdProjectId={createdProjectId}
      setCreatedProjectId={setCreatedProjectId}
      onSelectProjectId={onSelectProjectId}
      setAccessToken={setAccessToken}
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
  createdProjectId,
  setCreatedProjectId,
  onSelectProjectId,
  setAccessToken,
}: {
  createdProjectId: Project["id"] | undefined;
  setCreatedProjectId: (projectId: Project["id"]) => void;
  onSelectProjectId: (projectId: string, projectToken: string) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
}) {
  const [{ data, fetching, error }, rerunProjectsQuery] = useQuery<SelectProjectsQueryQuery>({
    query: SelectProjectsQuery,
  });

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(rerunProjectsQuery, 5000);
    return () => clearInterval(interval);
  }, [rerunProjectsQuery]);

  const [selectedAccountId, setSelectedAccountId] = useState<Account["id"]>();
  const selectedAccount = data?.viewer?.accounts.find((a) => a.id === selectedAccountId);

  const onSelectAccount = React.useCallback(
    (account: NonNullable<SelectProjectsQueryQuery["viewer"]>["accounts"][number]) => {
      setSelectedAccountId(account.id);
    },
    [setSelectedAccountId]
  );

  React.useEffect(() => {
    if (!selectedAccountId && data?.viewer?.accounts) {
      onSelectAccount(data.viewer.accounts[0]);
    }
  }, [data, selectedAccountId, onSelectAccount]);

  const [isSelectingProject, setSelectingProject] = useState(false);

  const handleSelectProject = React.useCallback(
    (
      project: NonNullable<
        NonNullable<
          NonNullable<SelectProjectsQueryQuery["viewer"]>["accounts"][number]["projects"]
        >[number]
      >
    ) => {
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

  const handler = useCallback<DialogHandler>(
    async (event) => {
      if (event.message === "createdProject") {
        // We don't know the project token yet, so we need to wait until it comes back on the query
        // longer be necessary once we don't write tokens any more
        // (https://linear.app/chromaui/issue/AP-3383/generate-an-app-token-for-each-build-rather-than-writing-project-token)
        rerunProjectsQuery();
        setCreatedProjectId(event.projectId);
      }
    },
    [rerunProjectsQuery, setCreatedProjectId]
  );

  const [openDialog, closeDialog] = useChromaticDialog(handler);

  // Once we find the project we created just above, close the dialog and select it
  const createdProject =
    createdProjectId && selectedAccount?.projects?.find((p) => p?.id.endsWith(createdProjectId));
  useEffect(() => {
    if (createdProject) {
      closeDialog();
      handleSelectProject(createdProject);
    }
  }, [createdProject, handleSelectProject, closeDialog]);

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
                          left={
                            <RepositoryOwnerAvatar
                              src={account.avatarUrl ?? undefined}
                              size="tiny"
                            />
                          }
                          onClick={() => onSelectAccount(account)}
                          active={selectedAccountId === account.id}
                        />
                      ))}
                    </List>
                  </Left>
                  <Right>
                    <ListHeading>Projects</ListHeading>
                    <List data-testid="right-list">
                      {selectedAccount?.projects?.map(
                        (project) =>
                          project && (
                            <ListItem
                              appearance="secondary"
                              key={project.id}
                              title={project.name}
                              right={<Icons icon="add" aria-label={project.name} />}
                              onClick={() => handleSelectProject(project)}
                              disabled={isSelectingProject}
                            />
                          )
                      )}
                      {selectedAccount && (
                        <ListItem
                          title={
                            // eslint-disable-next-line jsx-a11y/anchor-is-valid
                            <Link
                              isButton
                              withArrow
                              onClick={() => {
                                if (!selectedAccount?.newProjectUrl) {
                                  throw new Error("Unexpected missing `newProjectUrl` on account");
                                }
                                openDialog(selectedAccount.newProjectUrl);
                              }}
                            >
                              Create project
                            </Link>
                          }
                        />
                      )}
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
