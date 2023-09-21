import { styled } from "@storybook/theming";
import React, { useRef } from "react";
import { useClient } from "urql";

import { BackButton } from "../../components/BackButton";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { BackIcon } from "../../components/icons/BackIcon";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { graphql } from "../../gql";
import { Project } from "../../gql/graphql";
import { getFetchOptions } from "../../utils/graphQLClient";
import { fetchAccessToken, TokenExchangeParameters } from "../../utils/requestAccessToken";
import { useChromaticDialog } from "../../utils/useChromaticDialog";
import { useErrorNotification } from "../../utils/useErrorNotification";

const Digits = styled.ol(({ theme }) => ({
  display: "inline-flex",
  listStyle: "none",
  margin: 8,
  padding: 0,
  gap: 5,

  "li:not(:empty)": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px dashed ${theme.input.border}`,
    borderRadius: 4,
    width: 28,
    height: 32,
  },
}));

const ProjectCountQuery = graphql(/* GraphQL */ `
  query VisualTestsProjectCountQuery {
    viewer {
      projectCount
      accounts {
        newProjectUrl
      }
    }
  }
`);

interface VerifyProps {
  onBack: () => void;
  hasProjectId: boolean;
  setAccessToken: (token: string) => void;
  setCreatedProjectId: (projectId: Project["id"]) => void;
  exchangeParameters: TokenExchangeParameters;
}

export const Verify = ({
  onBack,
  hasProjectId,
  setAccessToken,
  setCreatedProjectId,
  exchangeParameters,
}: VerifyProps) => {
  const client = useClient();
  const onError = useErrorNotification();

  const { user_code: userCode, verificationUrl } = exchangeParameters;

  // Store the access token until we are ready to pass it to `setAccessToken` (at which point
  // the Panel will close the Authentication screen)
  const accessToken = useRef<string>();

  const [openDialog, closeDialog] = useChromaticDialog(async (event) => {
    // If the user logs in as part of the grant process, don't close the dialog,
    // instead redirect us back to where we were trying to go.
    if (event.message === "login") {
      openDialog(verificationUrl);
    }

    if (event.message === "grant") {
      try {
        const token = await fetchAccessToken(exchangeParameters);
        if (!token) throw new Error("Failed to fetch an access token");
        accessToken.current = token;

        const { data } = await client.query(
          ProjectCountQuery,
          {},
          { fetchOptions: () => getFetchOptions(token) }
        );

        if (!data?.viewer) throw new Error("Failed to fetch initial project list");

        // The user has projects to choose from (or the project is already selected),
        // so send them to pick one
        if (data.viewer.projectCount > 0 || hasProjectId) {
          setAccessToken(accessToken.current);
          closeDialog();
        } else {
          // The user has no projects, so we need to get them to create one, then close the dialog
          if (!data.viewer.accounts[0]) throw new Error("User has no accounts!");
          if (!data.viewer.accounts[0].newProjectUrl) {
            throw new Error("Unexpected missing project URL");
          }

          openDialog(data.viewer.accounts[0].newProjectUrl);
        }
      } catch (err) {
        onError("Login Error", err);
      }
    }

    if (event.message === "createdProject") {
      if (!accessToken.current) {
        onError("Unexpected missing access token", new Error());
      } else {
        setAccessToken(accessToken.current);
        setCreatedProjectId(`Project:${event.projectId}`);
        closeDialog();
      }
    }
  });

  return (
    <Container>
      <BackButton onClick={onBack}>
        <BackIcon />
        Back
      </BackButton>
      <Stack>
        <div>
          <Heading>Verify your account</Heading>
          <Text>
            Enter this verification code on Chromatic to grant access to your published Storybooks.
          </Text>
          <Digits>
            {userCode?.split("").map((char: string, index: number) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={`${index}-${char}`}>{char.replace(/[^A-Z0-9]/, "")}</li>
            ))}
          </Digits>
        </div>
        <Button secondary onClick={() => openDialog(verificationUrl)}>
          Go to Chromatic
        </Button>
      </Stack>
    </Container>
  );
};
