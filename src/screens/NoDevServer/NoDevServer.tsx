import React from "react";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

export const NoDevServer = () => {
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <VisualTestsIcon />
            <Heading>Visual tests</Heading>
            <Text>
              Running this addon with the Storybook dev server is not supported at this time.
            </Text>
          </div>
        </Stack>
      </Container>
    </Screen>
  );
};
