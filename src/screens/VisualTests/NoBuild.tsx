import { Icons, Link, Loader } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";
import { CombinedError } from "urql";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Bar, Col, Row, Section, Sections, Text } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { RunningBuildPayload } from "../../constants";

const buildFailureUrl = "https://www.chromatic.com/docs/?";

const ErrorContainer = styled.div(({ theme }) => ({
  display: "block",
  minWidth: "80%",
  background: "#FFF5CF",
  border: "1px solid #E69D0033",
  borderRadius: "2px",
  padding: "15px 20px",
  margin: "10px",
}));

interface NoBuildProps {
  queryError: CombinedError;
  hasData: boolean;
  hasStoryBuild: boolean;
  startDevBuild: () => void;
  runningBuild: RunningBuildPayload;
  branch: string;
  setAccessToken: (accessToken: string | null) => void;
}

export const NoBuild = ({
  queryError,
  hasData,
  hasStoryBuild,
  startDevBuild,
  runningBuild,
  branch,
  setAccessToken,
}: NoBuildProps) => {
  const isRunningBuildStarting = !["success", "error"].includes(runningBuild?.step);
  return (
    <Sections>
      <Section grow>
        {queryError && (
          <Row>
            <Col>
              <Text>{queryError.message}</Text>
            </Col>
          </Row>
        )}

        {!hasData && <Loader />}

        {hasData && !hasStoryBuild && !queryError && (
          <Container>
            <Heading>Create a test baseline</Heading>
            <CenterText>
              Take an image snapshot of each story to save their &quot;last known good state&quot;
              as test baselines.
            </CenterText>
            {runningBuild.step === "error" ? (
              <ErrorContainer>
                <b>Build failed:</b> <code>{[].concat(runningBuild.originalError)[0].message}</code>{" "}
                <Link target="_new" href={buildFailureUrl} withArrow>
                  Learn more
                </Link>
              </ErrorContainer>
            ) : (
              <br />
            )}

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
              {hasData ? `Waiting for build on ${branch}` : "Loading..."}
            </Text>
          </Col>
          <Col push>
            <FooterMenu setAccessToken={setAccessToken} />
          </Col>
        </Bar>
      </Section>
    </Sections>
  );
};
