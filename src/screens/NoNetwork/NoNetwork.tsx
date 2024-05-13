import { AlertIcon, SyncIcon } from "@storybook/icons";
import { useChannel } from "@storybook/manager-api";
import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { RETRY_CONNECTION } from "../../constants";

export const NoNetwork = () => {
  const emit = useChannel({});
  const retry = () => emit(RETRY_CONNECTION);
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
          <Button size="medium" variant="solid" onClick={retry}>
            <SyncIcon />
            Retry
          </Button>
          <Link href="https://status.chromatic.com" target="_blank" rel="noreferrer" withArrow>
            Chromatic API status
          </Link>
        </Stack>
      </Container>
    </Screen>
  );
};
