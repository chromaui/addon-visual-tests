import React from "react";

import { Box, BoxContent, BoxTitle } from "../../components/Box";
import { Code } from "../../components/Code";
import { Container } from "../../components/Container";
import { Icon, Link } from "../../components/design-system";
import { Heading } from "../../components/Heading";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { useUninstallAddon } from "../Uninstalled/UninstallContext";

export const GitNotFound = () => {
  const { uninstallAddon } = useUninstallAddon();
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
          <Box>
            <Icon icon="lock" />
            <BoxContent>
              <BoxTitle>Git not detected</BoxTitle>
              This addon requires Git to associate test results with commits and branches. Run{" "}
              <Code>git init</Code> and make your first commit
              <Code>git commit -m</Code> to get started!
            </BoxContent>
          </Box>
          <Link
            target="_blank"
            href="https://www.chromatic.com/docs/visual-tests-addon#git-addon"
            withArrow
            secondary
          >
            Visual tests requirements
          </Link>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link withArrow onClick={() => uninstallAddon()}>
            Uninstall
          </Link>
        </Stack>
      </Container>
    </Screen>
  );
};
