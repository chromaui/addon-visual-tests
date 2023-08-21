import { Icons, Link } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";
import { useQuery } from "urql";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { graphql } from "../../gql";
import { ProjectQueryQuery } from "../../gql/graphql";

const CheckIcon = styled(Icons)(({ theme }) => ({
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
  goToNext,
  setAccessToken,
}: {
  projectId: string;
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
                <CheckIcon icon="check" />
                <Heading>Project linked!</Heading>
                <Text style={{ maxWidth: 380 }}>
                  Your Storybook&apos;s <code>main.js</code> has been updated to include the{" "}
                  <code>projectId</code> of {data.project.name}. This project will be used to
                  reference prior tests. Please commit this change to continue using this addon.
                </Text>
                <Button secondary onClick={() => goToNext()}>
                  Catch a UI change
                </Button>
                <Text>
                  Why do we need a project ID?{" "}
                  <Link href="https://www.chromatic.com/docs/cli">Learn More »</Link>
                </Text>
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
      <Section>
        <Bar>
          <Col>
            {data?.project?.lastBuild && (
              <Text style={{ marginLeft: 5 }}>
                Last build: {data.project.lastBuild.number} on branch{" "}
                {data.project.lastBuild.branch}
              </Text>
            )}
          </Col>
          <Col push>
            <FooterMenu setAccessToken={setAccessToken} />
          </Col>
        </Bar>
      </Section>
    </Sections>
  );
};
