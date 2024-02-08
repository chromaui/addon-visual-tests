import { Link } from "@storybook/components";
import { StopIcon } from "@storybook/icons";
import React from "react";

import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Section, Sections } from "../../components/layout";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

interface BillingLimitReachedProps {
    accountId: string
}

export const BillingLimitReached = ({accountId}: BillingLimitReachedProps) => {
  return (
    <Sections>
      <Section grow>
        <Container>
          <Stack>
            <StopIcon size={42} opacity={0.5} />
            <Heading>Tests did not run</Heading>
            <Text>Tests did not run because hichroma's account was over the free snapshot limit. Visit your account’s billing page to find out more.</Text>
            <Link isButton withArrow target="_blank" href={`https://www.chromatic.com/billing?accountId=${accountId}`}>
              Go to billing
            </Link>
          </Stack>
        </Container>
      </Section>
    </Sections>
  );
};
