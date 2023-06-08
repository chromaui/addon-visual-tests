import React from "react";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Text } from "../../components/Text";
import { VisualTestsIcon } from "../../components/VisualTestsIcon";
import { Button } from "../../components/Button";
import { Stack } from "../../components/Stack";

interface WelcomeProps {
  onEnable: () => void;
}

export const Welcome = ({ onEnable }: WelcomeProps) => (
  <Container>
    <Stack>
      <div>
        <VisualTestsIcon />
        <Heading>Visual tests</Heading>
        <Text>
          Catch bugs in UI appearance automatically. Compare image snapshots to detect visual
          changes.
        </Text>
      </div>
      <Button appearance="secondary" onClick={onEnable}>
        Enable
      </Button>
    </Stack>
  </Container>
);
