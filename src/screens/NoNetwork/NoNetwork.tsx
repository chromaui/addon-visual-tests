import { AlertIcon } from "@storybook/icons";
import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

export const NoNetwork = () => {
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <AlertIcon width={32} height={32} />
          <div>
            <Heading>Can't connect to Chromatic</Heading>
            <Text center muted>
              Double check your internet connection and firewall settings.
            </Text>
          </div>
          <Button asChild size="medium" variant="solid">
            <a href="https://status.chromatic.com" target="_blank" rel="noreferrer">
              Check API status
            </a>
          </Button>
        </Stack>
      </Container>
    </Screen>
  );
};
