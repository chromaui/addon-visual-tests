import React from "react";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

export const Uninstalled = () => {
  return (
    <Screen footer={false}>
      <Container>
        <Stack>
          <div>
            <VisualTestsIcon />
            <Heading>Visual tests</Heading>
            <Text>Visual tests has been uninstalled. Please restart your Storybook.</Text>
          </div>
        </Stack>
      </Container>
    </Screen>
  );
};
