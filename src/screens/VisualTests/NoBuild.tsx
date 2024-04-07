import { Loader } from "@storybook/components";
import { PlayIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";
import { CombinedError } from "urql";

import { useAuthState } from "../../AuthContext";
import { BuildProgressInline } from "../../components/BuildProgressBarInline";
import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { FooterMenu } from "../../components/FooterMenu";
import { Heading } from "../../components/Heading";
import { Col } from "../../components/layout";
import { Footer, Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { DOCS_URL } from "../../constants";
import { LocalBuildProgress } from "../../types";
import { ErrorBox } from "../Errors/BuildError";
import { useRunBuildState } from "./RunBuildContext";

const ButtonStackLink = styled(Link)(() => ({
  marginTop: 5,
}));

interface NoBuildProps {
  queryError?: CombinedError;
  hasData: boolean;
  hasProject: boolean;
  hasSelectedBuild: boolean;
  localBuildProgress?: LocalBuildProgress;
  branch: string;
}

export const NoBuild = ({
  queryError,
  hasData,
  hasProject,
  hasSelectedBuild,
  localBuildProgress,
  branch,
}: NoBuildProps) => {
  const { setAccessToken } = useAuthState();
  const { isRunning, startBuild } = useRunBuildState();

  const getDetails = () => {
    const button = (
      <Button disabled={isRunning} size="medium" variant="solid" onClick={startBuild}>
        <PlayIcon />
        Take snapshots
      </Button>
    );

    if (!localBuildProgress) {
      return button;
    }
    if (localBuildProgress.currentStep === "error") {
      return (
        <>
          <ErrorBox localBuildProgress={localBuildProgress} title="Build failed" />
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
              <Text>{queryError.networkError.message}</Text>
            </div>

            <Button size="medium" variant="solid" onClick={() => setAccessToken(null)}>
              Log out
            </Button>
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
              <Text center muted>
                {queryError.graphQLErrors[0].extensions.code === "FORBIDDEN"
                  ? "You may have insufficient permissions. Try logging out and back in again."
                  : "Try logging out or clear your browser's local storage."}
              </Text>
            </div>
            <ButtonStack>
              <Button size="medium" variant="solid" onClick={() => setAccessToken(null)}>
                Log out
              </Button>
              <ButtonStackLink withArrow href={`${DOCS_URL}#troubleshooting`} target="_blank">
                Troubleshoot
              </ButtonStackLink>
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
              <Text center muted>
                You may not have access to this project or it may not exist.
              </Text>
            </div>

            <ButtonStackLink isButton onClick={() => setAccessToken(null)} withArrow>
              Switch account
            </ButtonStackLink>
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
              <Text center muted>
                Take an image snapshot of your stories to save their &quot;last known good
                state&quot; as test baselines.
              </Text>
            </div>
            {getDetails()}
          </Stack>
        </Container>
      );
    }

    return null;
  };

  return (
    <Screen
      footer={
        <Footer>
          <Col>
            {hasData && !queryError && hasProject && (
              <Text muted style={{ marginLeft: 5 }}>
                Waiting for build on {branch}
              </Text>
            )}
          </Col>
          <Col push>
            <FooterMenu />
          </Col>
        </Footer>
      }
    >
      {getContent()}
    </Screen>
  );
};
