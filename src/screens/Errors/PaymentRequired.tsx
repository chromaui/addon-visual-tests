import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

export const PaymentRequired = ({
  children,
  billingUrl,
}: {
  children?: React.ReactNode;
  billingUrl?: string | null;
}) => {
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Payment required</Heading>
            <Text center muted>
              Your subscription payment is past due. Review or replace your payment method continue
              using Chromatic.
            </Text>
          </div>

          {billingUrl && (
            <Button asChild size="medium" variant="solid">
              <a href={billingUrl} target="_new">
                Review billing details
              </a>
            </Button>
          )}

          {children}
        </Stack>
      </Container>
    </Screen>
  );
};
