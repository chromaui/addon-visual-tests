import { Icons, Loader } from "@storybook/components";
import React from "react";
import { CombinedError } from "urql";

import { BuildProgressLabel } from "../../components/BuildProgressLabel";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { Bar, Col, Row, Section, Sections, Text } from "../../components/layout";
import { ProgressBar, ProgressTrack } from "../../components/SidebarTopButton";
import { Text as CenterText } from "../../components/Text";
import { LocalBuildProgress } from "../../types";

interface NoBuildProps {
  error: CombinedError;
  hasData: boolean;
  hasStoryBuild: boolean;
  startDevBuild: () => void;
  localBuildProgress: LocalBuildProgress;
  branch: string;
  setAccessToken: (accessToken: string | null) => void;
}

export const NoBuild = ({
  error,
  hasData,
  hasStoryBuild,
  startDevBuild,
  localBuildProgress,
  branch,
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

      {!hasData && <Loader />}

      {hasData && !hasStoryBuild && !error && (
        <Container>
          <Heading>Create a test baseline</Heading>
          <CenterText>
            Take an image snapshot of each story to save their &quot;last known good state&quot; as
            test baselines.
          </CenterText>
          {localBuildProgress ? (
            <CenterText style={{ display: "flex", flexDirection: "column", gap: 10, width: 200 }}>
              <ProgressTrack>
                {typeof localBuildProgress.buildProgressPercentage === "number" && (
                  <ProgressBar
                    style={{ width: `${localBuildProgress.buildProgressPercentage}%` }}
                  />
                )}
              </ProgressTrack>
              <BuildProgressLabel localBuildProgress={localBuildProgress} />
            </CenterText>
          ) : (
            <>
              <br />
              <Button small secondary onClick={startDevBuild}>
                <Icons icon="play" />
                Take snapshots
              </Button>
            </>
          )}
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
