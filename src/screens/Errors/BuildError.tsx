import React, { ReactNode } from "react";
import stripAnsi from "strip-ansi";

import { Box } from "../../components/Box";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { DOCS_URL } from "../../constants";
import { LocalBuildProgress } from "../../types";
import { useTelemetry } from "../../utils/TelemetryContext";

const NewlinesAsBreaks = ({ content }: { content: string }) => {
  const lines = content.split(/\r?\n/);
  return (
    <>
      {lines.reduce<ReactNode[]>(
        (acc, line, index) => acc.concat([index && <br />, line].filter(Boolean)),
        [],
      )}
    </>
  );
};

export const ErrorBox = ({
  localBuildProgress,
  title,
}: {
  localBuildProgress: LocalBuildProgress;
  title?: string;
}) => (
  <Box warning>
    <Text>
      <span>
        {title && <b>{title}: </b>}
        <NewlinesAsBreaks
          content={stripAnsi(
            Array.isArray(localBuildProgress.originalError)
              ? localBuildProgress.originalError[0]?.message
              : localBuildProgress.originalError?.message || "Unknown error",
          )}
        />
      </span>{" "}
      <Link
        target="_blank"
        href={localBuildProgress.errorDetailsUrl || `${DOCS_URL}#troubleshooting`}
        withArrow
      >
        {localBuildProgress.errorDetailsUrl ? "Details" : "Troubleshoot"}
      </Link>
    </Text>
  </Box>
);

export const BuildError = ({
  children,
  localBuildProgress,
}: {
  children?: React.ReactNode;
  localBuildProgress: LocalBuildProgress;
}) => {
  useTelemetry("Errors", "BuildError");
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Build failed</Heading>
            <Text center muted>
              Check the Storybook process on the command line for more details.
            </Text>
          </div>
          <ErrorBox localBuildProgress={localBuildProgress} />

          {children}
        </Stack>
      </Container>
    </Screen>
  );
};
