import { styled } from "@storybook/theming";
import React from "react";
import stripAnsi from "strip-ansi";

import { Box, BoxContent, BoxTitle } from "../../components/Box";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { DOCS_URL } from "../../constants";
import { LocalBuildProgress } from "../../types";

const StyledText = styled(Text)(({ theme }) => ({
  color: theme.base === "light" ? theme.color.dark : "#C9CDCF",
}));

export const ErrorBox = ({
  localBuildProgress,
  title,
}: {
  localBuildProgress: LocalBuildProgress;
  title?: string;
}) => (
  <Box warning>
    <BoxContent>
      <span>
        {title && <b>{title}: </b>}
        {stripAnsi(
          Array.isArray(localBuildProgress.originalError)
            ? localBuildProgress.originalError[0]?.message
            : localBuildProgress.originalError?.message || "Unknown error"
        )}
      </span>{" "}
      <Link
        target="_blank"
        href={localBuildProgress.errorDetailsUrl || `${DOCS_URL}#troubleshooting`}
        withArrow
      >
        {localBuildProgress.errorDetailsUrl ? "Details" : "Troubleshoot"}
      </Link>
    </BoxContent>
  </Box>
);

export const BuildError = ({
  children,
  localBuildProgress,
}: {
  children?: React.ReactNode;
  localBuildProgress: LocalBuildProgress;
}) => {
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Build failed</Heading>
            <StyledText>
              Check the Storybook process on the command line for more details.
            </StyledText>
          </div>
          <ErrorBox localBuildProgress={localBuildProgress} />

          {children}
        </Stack>
      </Container>
    </Screen>
  );
};
