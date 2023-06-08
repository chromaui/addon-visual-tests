import React from "react";

import { Container } from "../components/Container";
import { Heading } from "../components/Heading";
import { Text } from "../components/Text";
import { Stack } from "../components/Stack";

export const SelectProject = () => (
  <Container>
    <Stack>
      <div>
        <Heading>Select a project</Heading>
        <Text>Baselines will be used with this project.</Text>
      </div>
    </Stack>
  </Container>
);
