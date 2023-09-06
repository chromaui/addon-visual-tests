import { Icons, Loader } from "@storybook/components";
import React from "react";
import { CombinedError } from "urql";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Bar, Col, Row, Section, Sections, Text } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { GitInfoPayload } from "../../constants";
import { AddonVisualTestsBuildQuery, NextBuildFieldsFragment } from "../../gql/graphql";

interface NoBuildProps {
  error: CombinedError;
  data: AddonVisualTestsBuildQuery;
  nextBuild: NextBuildFieldsFragment;
  startDevBuild: () => void;
  isRunningBuildStarting: boolean;
  gitInfo: Pick<
    GitInfoPayload,
    "slug" | "branch" | "committedAt" | "uncommittedHash" | "userEmailHash"
  >;
  setAccessToken: (accessToken: string | null) => void;
}

export const NoBuild = ({
  error,
  data,
  nextBuild,
  startDevBuild,
  isRunningBuildStarting,
  gitInfo,
  setAccessToken,
}: NoBuildProps) => (
  <Sections>
    <Section grow>
      {error && (
        <Row>
          <Col>
            <Text>{error.message}</Text>
          </Col>
        </Row>
      )}

      {!data && <Loader />}

      {data && !nextBuild && !error && (
        <Container>
          <Heading>Create a test baseline</Heading>
          <CenterText>
            Take an image snapshot of each story to save their &quot;last known good state&quot; as
            test baselines.
          </CenterText>
          <br />
          <Button small secondary onClick={startDevBuild} disabled={isRunningBuildStarting}>
            {isRunningBuildStarting ? (
              <ProgressIcon parentComponent="Button" style={{ marginRight: 6 }} />
            ) : (
              <Icons icon="play" />
            )}
            Take snapshots
          </Button>
        </Container>
      )}
    </Section>

    <Section>
      <Bar>
        <Col>
          <Text style={{ marginLeft: 5 }}>
            {data ? `Waiting for build on ${gitInfo.branch}` : "Loading..."}
          </Text>
        </Col>
        <Col push>
          <FooterMenu setAccessToken={setAccessToken} />
        </Col>
      </Bar>
    </Section>
  </Sections>
);
