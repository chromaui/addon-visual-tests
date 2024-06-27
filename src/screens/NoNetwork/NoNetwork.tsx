import { SyncIcon } from "@storybook/icons";
import { useChannel } from "@storybook/manager-api";
import { styled } from "@storybook/theming";
import React, { useEffect, useState } from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { rotate360 } from "../../components/design-system/shared/animation";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { RETRY_CONNECTION } from "../../constants";

const SpinIcon = styled(SyncIcon)({
  animation: `${rotate360} 1s linear infinite`,
});

export const NoNetwork = ({ aborted, online }: { aborted: boolean; online: boolean }) => {
  const [retried, setRetried] = useState(false);
  const emit = useChannel({});

  const retry = () => {
    setRetried(true);
    emit(RETRY_CONNECTION);
  };

  useEffect(() => {
    setRetried(false);
  }, [aborted]);

  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Can't connect to Chromatic</Heading>
            <Text center muted>
              {online
                ? "We're having trouble connecting to the Chromatic API."
                : "You're offline. Double check your internet connection."}
            </Text>
          </div>
          {aborted ? (
            <Button size="medium" variant="solid" onClick={retry} disabled={retried}>
              <SyncIcon />
              Retry
            </Button>
          ) : (
            <Button size="medium" variant="ghost" onClick={retry} disabled={retried}>
              <SpinIcon />
              Connecting...
            </Button>
          )}
          <Link href="https://status.chromatic.com" target="_blank" rel="noreferrer" withArrow>
            Chromatic API status
          </Link>
        </Stack>
      </Container>
    </Screen>
  );
};
