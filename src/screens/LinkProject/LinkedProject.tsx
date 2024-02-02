import { Link } from "@storybook/components";
import { CheckIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";
import { useQuery } from "urql";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { Col, Section, Sections, Text } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { graphql } from "../../gql";
import { ProjectQueryQuery } from "../../gql/graphql";

const Check = styled(CheckIcon)(({ theme }) => ({
  width: 40,
  height: 40,
  padding: 10,
  background: theme.color.positive,
  borderRadius: "100%",
  color: "white",
}));

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
  configFile,
  goToNext,
  setAccessToken,
}: {
  projectId: string;
  configFile: string;
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
                <Check />
                <Heading>Project linked!</Heading>
                <Text style={{ maxWidth: 380 }}>
                  The <code>projectId</code> for {data.project.name} has been added to this
                  project's <code>{configFile}</code>. This will be used to sync with Chromatic.
                  Please commit this change to continue using this addon.
                </Text>
                <Button variant="solid" size="medium" onClick={() => goToNext()}>
                  Catch a UI change
                </Button>
                <Text>
                  Why do we need a project ID?{" "}
                  <Link href="https://www.chromatic.com/docs/cli" target="_blank">
                    Learn More »
                  </Link>
                </Text>
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
      <FooterSection
        setAccessToken={setAccessToken}
        render={({ menu }) => (
          <>
            <Col>
              {data?.project?.lastBuild && (
                <Text style={{ marginLeft: 5 }}>
                  Last build: {data.project.lastBuild.number} on branch{" "}
                  {data.project.lastBuild.branch}
                </Text>
              )}
            </Col>
            <Col push>{menu}</Col>
          </>
        )}
      />
    </Sections>
  );
};
