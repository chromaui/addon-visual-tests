import { Loader } from "@storybook/components";
import { PlayIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import { lighten } from "polished";
import React from "react";
import { CombinedError } from "urql";

import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { FooterSection } from "../../components/FooterSection";
import { Heading } from "../../components/Heading";
import { Col, Section, Sections, Text } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text as CenterText } from "../../components/Text";
import { LocalBuildProgress } from "../../types";

const buildFailureUrl = "https://www.chromatic.com/docs/setup/#troubleshooting";

const ErrorContainer = styled.pre(({ theme }) => ({
  display: "block",
  minWidth: "80%",
  color: theme.color.warningText,
  background: theme.background.warning,
  border: `1px solid ${lighten(0.5, theme.color.warningText)}`,
  borderRadius: 2,
  padding: 15,
  margin: 0,
  fontSize: theme.typography.size.s1,
  textAlign: "left",
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
      return <>{button}</>;
    }

    if (localBuildProgress.currentStep === "error") {
      const firstError = Array.isArray(localBuildProgress.originalError)
        ? localBuildProgress.originalError[0]
        : localBuildProgress.originalError;

      return (
        <>
          <ErrorContainer>
            Build failed: {firstError?.message || "Unknown Error"}{" "}
            <Link target="_blank" href={buildFailureUrl} withArrow>
              View full error
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
          <Stack>
            <div>
              <Heading>Network error</Heading>
              <CenterText>{queryError.networkError.message}</CenterText>
            </div>

            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link isButton onClick={() => setAccessToken(null)} withArrow>
              Log out
            </Link>
          </Stack>
        </Container>
      );
    }

    if (queryError?.graphQLErrors?.length) {
      return (
        <Container>
          <Stack>
            <div>
              <Heading>{queryError.graphQLErrors[0].message}</Heading>
              <CenterText>
                {queryError.graphQLErrors[0].extensions.code === "FORBIDDEN"
                  ? "You may have insufficient permissions. Try logging out and back in again."
                  : "Try logging out or clear your browser's local storage."}
              </CenterText>
            </div>
            <ButtonStack>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <Link isButton onClick={() => setAccessToken(null)} withArrow>
                Log out
              </Link>
              <Link
                withArrow
                href="https://www.chromatic.com/docs/visual-tests-addon#troubleshooting"
                target="_blank"
              >
                Troubleshoot
              </Link>
            </ButtonStack>
          </Stack>
        </Container>
      );
    }

    if (!hasData) {
      return <Loader />;
    }

    if (!hasProject) {
      return (
        <Container>
          <Stack>
            <div>
              <Heading>Project not found</Heading>
              <CenterText>You may not have access to this project or it may not exist.</CenterText>
            </div>

            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link isButton onClick={() => setAccessToken(null)} withArrow>
              Switch account
            </Link>
          </Stack>
        </Container>
      );
    }

    if (!hasSelectedBuild) {
      return (
        <Container>
          <Stack>
            <div>
              <Heading>Create a test baseline</Heading>
              <CenterText>
                Take an image snapshot of each story to save their &quot;last known good state&quot;
                as test baselines.
              </CenterText>
            </div>
            {getDetails()}
          </Stack>
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
