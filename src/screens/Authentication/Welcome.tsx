import { Link } from "@storybook/design-system";
import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
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
            <Button secondary onClick={onNext}>
              Enable
            </Button>

            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link
              secondary
              onClick={() => {
                onUninstall();
                setShowRestart(true);
              }}
            >
              Uninstall
            </Link>
          </>
        )}
      </Stack>
    </Container>
  );
};
