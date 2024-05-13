import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { useTelemetry } from "../../utils/TelemetryContext";

export const VisualTestsDisabled = ({
  children,
  manageUrl,
}: {
  children?: React.ReactNode;
  manageUrl: string;
}) => {
  useTelemetry("Errors", "VisualTestsDisabled");

  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Visual Tests disabled for your project</Heading>
            <Text center muted>
              Update your project settings to enable visual testing.
            </Text>
          </div>

          <Button asChild size="medium" variant="solid">
            <a href={manageUrl} target="_new">
              Manage project settings
            </a>
          </Button>

          {children}
        </Stack>
      </Container>
    </Screen>
  );
};
