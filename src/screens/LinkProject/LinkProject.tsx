import { Link } from "@storybook/components";
import { AddIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "urql";

import { Container } from "../../components/Container";
import { Avatar, ListItem } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { Text } from "../../components/layout";
import { Screen } from "../../components/Screen";
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
}: {
  createdProjectId: Project["id"] | undefined;
  setCreatedProjectId: (projectId: Project["id"]) => void;
  onUpdateProject: (projectId: string) => void;
}) => {
  const onSelectProjectId = React.useCallback(
    async (selectedProjectId: string) => {
      await onUpdateProject(selectedProjectId);
    },
    [onUpdateProject]
  );

  return (
    <SelectProject
      createdProjectId={createdProjectId}
      setCreatedProjectId={setCreatedProjectId}
      onSelectProjectId={onSelectProjectId}
    />
  );
};

const ListHeading = styled.div(({ theme }) => ({
  fontSize: `${theme.typography.size.s1 - 1}px`,
  fontWeight: theme.typography.weight.bold,
  color: theme.base === "light" ? theme.color.dark : theme.color.light,
  backgroundColor: "inherit",
  padding: "7px 15px",
  borderBottom: `1px solid ${theme.appBorderColor}`,
  lineHeight: "18px",
  letterSpacing: "0.38em",
  textTransform: "uppercase",
}));

const Left = styled.div(({ theme }) => ({}));

const Right = styled.div(({ theme }) => ({
  background: theme.base === "light" ? theme.color.lighter : theme.color.darker,
}));

const ProjectPicker = styled.div(({ theme }) => ({
  background: theme.base === "light" ? theme.color.lightest : theme.color.darkest,
  borderRadius: 5,
  border: `1px solid ${theme.appBorderColor}`,
  height: 260,
  maxWidth: 420,
  minWidth: 260,
  width: "100%",
  overflow: "hidden",
  textAlign: "left",
  position: "relative",
  display: "flex",
  "> *": {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    width: "50%",
  },
}));

const List = styled.div({
  height: "100%",
  overflowY: "auto",
});

const StyledStack = styled(Stack)({
  width: "100%",
});

const RepositoryOwnerAvatar = styled(Avatar)({
  marginRight: 10,
});

function SelectProject({
  createdProjectId,
  setCreatedProjectId,
  onSelectProjectId,
}: {
  createdProjectId: Project["id"] | undefined;
  setCreatedProjectId: (projectId: Project["id"]) => void;
  onSelectProjectId: (projectId: string) => Promise<void>;
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

  useEffect(() => {
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
      onSelectProjectId(project.id);
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
    <Screen>
      <Container>
        <StyledStack>
          <div>
            <Heading>Select a project</Heading>
            <Text>Your tests will sync with this project.</Text>
          </div>
          {error && <p>{error.message}</p>}
          {!data && fetching && (
            <ProjectPicker>
              <Left>
                <ListHeading>Accounts</ListHeading>
                <List>
                  <ListItem appearance="secondary" isLoading />
                  <ListItem appearance="secondary" isLoading />
                  <ListItem appearance="secondary" isLoading />
                  <ListItem appearance="secondary" isLoading />
                  <ListItem appearance="secondary" isLoading />
                </List>
              </Left>
              <Right>
                <ListHeading>Projects</ListHeading>
                <List data-testid="right-list">
                  <ListItem appearance="secondary" isLoading />
                  <ListItem appearance="secondary" isLoading />
                  <ListItem appearance="secondary" isLoading />
                </List>
              </Right>
            </ProjectPicker>
          )}
          {data?.viewer?.accounts && (
            <ProjectPicker>
              <Left>
                <ListHeading>Accounts</ListHeading>
                <List data-testid="left-list">
                  {data.viewer.accounts?.map((account) => (
                    <ListItem
                      key={account.id}
                      title={account.name}
                      appearance="secondary"
                      left={
                        <RepositoryOwnerAvatar src={account.avatarUrl ?? undefined} size="tiny" />
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
                          Create new project
                        </Link>
                      }
                    />
                  )}
                  {selectedAccount?.projects?.map(
                    (project) =>
                      project && (
                        <ListItem
                          appearance="secondary"
                          key={project.id}
                          title={project.name}
                          right={<AddIcon aria-label={project.name} />}
                          onClick={() => handleSelectProject(project)}
                          disabled={isSelectingProject}
                        />
                      )
                  )}
                </List>
              </Right>
            </ProjectPicker>
          )}
        </StyledStack>
      </Container>
    </Screen>
  );
}
