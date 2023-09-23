import { Icons, Link, Loader } from "@storybook/components";
import { styled } from "@storybook/theming";
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

const buildFailureUrl = "https://www.chromatic.com/docs/?";

const ErrorContainer = styled.div(({ theme }) => ({
  display: "block",
  minWidth: "80%",
  background: "#FFF5CF",
  border: "1px solid #E69D0033",
  borderRadius: "2px",
  padding: "15px 20px",
  margin: "10px 10px 18px 10px",
}));

interface NoBuildProps {
  queryError?: CombinedError;
  hasData: boolean;
  hasSelectedBuild: boolean;
  startDevBuild: () => void;
  localBuildProgress?: LocalBuildProgress;
  branch: string;
  setAccessToken: (accessToken: string | null) => void;
}

export const NoBuild = ({
  queryError,
  hasData,
  hasSelectedBuild,
  startDevBuild,
  localBuildProgress,
  branch,
  setAccessToken,
}: NoBuildProps) => {
  const button = (
    <Button small secondary onClick={startDevBuild}>
      <Icons icon="play" />
      Take snapshots
    </Button>
  );

  let contents;
  if (localBuildProgress) {
    if (localBuildProgress.currentStep === "error") {
      const firstError = Array.isArray(localBuildProgress.originalError)
        ? localBuildProgress.originalError[0]
        : localBuildProgress.originalError;
      contents = (
        <>
          <ErrorContainer>
            <b>Build failed:</b> <code>{firstError?.message || "Unknown Error"}</code>{" "}
            <Link target="_new" href={buildFailureUrl} withArrow>
              Learn more
            </Link>
          </ErrorContainer>

          {button}
        </>
      );
    } else {
      contents = (
        <CenterText style={{ display: "flex", flexDirection: "column", gap: 10, width: 200 }}>
          <ProgressTrack>
            {typeof localBuildProgress.buildProgressPercentage === "number" && (
              <ProgressBar style={{ width: `${localBuildProgress.buildProgressPercentage}%` }} />
            )}
          </ProgressTrack>
          <BuildProgressLabel localBuildProgress={localBuildProgress} />
        </CenterText>
      );
    }
  } else {
    contents = (
      <>
        <br />
        {button}
      </>
    );
  }

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

        {hasData && !hasSelectedBuild && !queryError && (
          <Container>
            <Heading>Create a test baseline</Heading>
            <CenterText>
              Take an image snapshot of each story to save their &quot;last known good state&quot;
              as test baselines.
            </CenterText>
            {contents}
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
