import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Link } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

interface WelcomeProps {
  onNext: () => void;
  onUninstall: () => void;
}

export const Welcome = ({ onNext, onUninstall }: WelcomeProps) => {
  const [showRestart, setShowRestart] = React.useState(false);

  return (
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
        {showRestart ? (
          <Text>Visual tests has been uninstalled. Please restart your Storybook.</Text>
        ) : (
          <>
            <Button variant="solid" size="medium" onClick={onNext}>
              Enable
            </Button>
            <Button
              link
              onClick={() => {
                onUninstall();
                setShowRestart(true);
              }}
            >
              Uninstall
            </Button>
          </>
        )}
      </Stack>
    </Container>
  );
};
