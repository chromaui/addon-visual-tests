import { styled } from "@storybook/theming";
import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { LocalBuildProgress } from "../../types";

const StyledText = styled(Text)(({ theme }) => ({
  color: theme.base === "light" ? theme.color.dark : "#C9CDCF",
}));

export const BuildLimited = ({
  children,
  localBuildProgress,
}: {
  children?: React.ReactNode;
  localBuildProgress: LocalBuildProgress;
}) => {
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Snapshot limit reached</Heading>
            <StyledText>
              Your account has reached its monthly snapshot limit. Visual testing is disabled.
              Upgrade your plan to increase your quota.
            </StyledText>
          </div>

          <Button asChild size="medium" variant="solid">
            <a href={localBuildProgress.errorDetailsUrl} target="_new">
              Upgrade plan
            </a>
          </Button>

          {children}
        </Stack>
      </Container>
    </Screen>
  );
};
