import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

interface WelcomeProps {
  onNext: () => void;
  onUninstall: () => void;
}

export const Welcome = ({ onNext, onUninstall }: WelcomeProps) => {
  return (
    <Screen footer={null}>
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
          <Button variant="solid" size="medium" onClick={onNext}>
            Enable
          </Button>
          <Button link onClick={() => onUninstall()}>
            Uninstall
          </Button>
        </Stack>
      </Container>
    </Screen>
  );
};
