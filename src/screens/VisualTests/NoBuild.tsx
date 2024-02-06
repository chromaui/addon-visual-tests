import { Loader } from "@storybook/components";
import { PlayIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";
import { CombinedError } from "urql";

import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { Col, Section, Sections, Text } from "../../components/layout";
import { Text as CenterText } from "../../components/Text";
import { LocalBuildProgress } from "../../types";

const buildFailureUrl = "https://www.chromatic.com/docs/setup/#troubleshooting";

const ErrorContainer = styled.div(({ theme }) => ({
  display: "block",
  minWidth: "80%",
  color: theme.color.darker,
  background: "#FFF5CF",
  border: "1px solid #E69D0033",
  borderRadius: 2,
  padding: "15px 20px",
  margin: "10px 10px 18px 10px",
}));

interface NoBuildProps {
  queryError?: CombinedError;
  hasData: boolean;
  hasProject: boolean;
  hasSelectedBuild: boolean;
  startDevBuild: () => void;
  localBuildProgress?: LocalBuildProgress;
  branch: string;
  setAccessToken: (accessToken: string | null) => void;
}

export const NoBuild = ({
  queryError,
  hasData,
  hasProject,
  hasSelectedBuild,
  startDevBuild,
  localBuildProgress,
  branch,
  setAccessToken,
}: NoBuildProps) => {
  const getDetails = () => {
    const button = (
      <Button size="medium" variant="solid" onClick={startDevBuild}>
        <PlayIcon />
        Take snapshots
      </Button>
    );

    if (!localBuildProgress) {
      return (
        <>
          <br />
          {button}
        </>
      );
    }

    if (localBuildProgress.currentStep === "error") {
      const firstError = Array.isArray(localBuildProgress.originalError)
        ? localBuildProgress.originalError[0]
        : localBuildProgress.originalError;

      return (
        <>
          <ErrorContainer>
            <b>Build failed:</b> <code>{firstError?.message || "Unknown Error"}</code>{" "}
            <Link target="_blank" href={buildFailureUrl} withArrow>
              Learn more
            </Link>
          </ErrorContainer>
          {button}
        </>
      );
    }

    return <BuildProgressInline localBuildProgress={localBuildProgress} />;
  };

  const getContent = () => {
    if (queryError?.networkError) {
      return (
        <Container>
          <Heading>Network error</Heading>
          <CenterText>{queryError.networkError.message}</CenterText>
          <br />
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link isButton onClick={() => setAccessToken(null)} withArrow>
            Log out
          </Link>
        </Container>
      );
    }

    if (queryError?.graphQLErrors?.length) {
      return (
        <Container>
          <Heading>{queryError.graphQLErrors[0].message}</Heading>
          <CenterText>
            {queryError.graphQLErrors[0].extensions.code === "FORBIDDEN"
              ? "You may have insufficient permissions. Try logging out and back in again."
              : "Try logging out or clear your browser's local storage."}
          </CenterText>
          <br />
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link isButton onClick={() => setAccessToken(null)} withArrow>
            Log out
          </Link>
        </Container>
      );
    }

    if (!hasData) {
      return <Loader />;
    }

    if (!hasProject) {
      return (
        <Container>
          <Heading>Project not found</Heading>
          <CenterText>You may not have access to this project or it may not exist.</CenterText>
          <br />
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link isButton onClick={() => setAccessToken(null)} withArrow>
            Switch account
          </Link>
        </Container>
      );
    }

    if (!hasSelectedBuild) {
      return (
        <Container>
          <Heading>Create a test baseline</Heading>
          <CenterText>
            Take an image snapshot of each story to save their &quot;last known good state&quot; as
            test baselines.
          </CenterText>
          {getDetails()}
        </Container>
      );
    }

    return null;
  };

  return (
    <Sections>
      <Section grow>{getContent()}</Section>
      <FooterSection
        setAccessToken={setAccessToken}
        render={({ menu }) => (
          <>
            <Col>
              {hasData && !queryError && hasProject && (
                <Text style={{ marginLeft: 5 }}>Waiting for build on {branch}</Text>
              )}
            </Col>
            <Col push>{menu}</Col>
          </>
        )}
      />
    </Sections>
  );
};
