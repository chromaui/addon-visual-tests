import { Header, Icon, ListItem } from "@storybook/design-system";
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

export const LinkProject = ({ onUpdateProjectId }: { onUpdateProjectId: (v: string) => void }) => {
  const onSelectProjectId = React.useCallback(
    (selectedProjectId: string) => {
      onUpdateProjectId(selectedProjectId);
    },
    [onUpdateProjectId]
  );

  return <SelectProject onSelectProjectId={onSelectProjectId} />;
};

const ListHeading = styled.div`
  width: 195px;
  background-color: ${({ theme }) => theme.background.app};
  padding: 9px 15px;

  & nth-child(1) {
    background-color: ${({ theme }) => theme.color.lighter};
  }
`;

const LeftList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background-color: FFFFFF;
`;

const RightList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background-color: F7FAFC;
`;

function SelectProject({ onSelectProjectId }: { onSelectProjectId: (id: string) => void }) {
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
          <div>
            <ListHeading>Accounts</ListHeading>
            <LeftList>
              {data.accounts?.map((account) => (
                <ListItem
                  key={account.id}
                  title={account.name}
                  onClick={() => onSelectAccount(account)}
                />
              ))}
            </LeftList>
          </div>
          <div>
            <ListHeading>Projects</ListHeading>
            <RightList>
              {selectedAccount?.projects?.map((project) => (
                <ListItem
                  key={project.id}
                  title={project.name}
                  onClick={() => onSelectProjectId(project.id)}
                />
              ))}
            </RightList>
          </div>
        </Row>
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
