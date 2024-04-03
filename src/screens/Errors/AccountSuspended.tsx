import React from "react";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Screen } from "../../components/Screen";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { AccountSuspensionReason } from "../../gql/graphql";

const reasons = {
  [AccountSuspensionReason.ExceededThreshold]: {
    heading: "Snapshot limit reached",
    message:
      "Your account has reached its monthly snapshot limit. Visual testing is disabled. Upgrade your plan to increase your quota.",
    action: "Upgrade plan",
  },
  [AccountSuspensionReason.PaymentRequired]: {
    heading: "Payment required",
    message:
      "Your subscription payment is past due. Review or replace your payment method continue using Chromatic.",
    action: "Review billing details",
  },
  [AccountSuspensionReason.Other]: {
    heading: "Account suspended",
    message: "Your account has been suspended. Contact customer support for details.",
    action: "Billing details",
  },
};

export const AccountSuspended = ({
  children,
  billingUrl,
  suspensionReason = AccountSuspensionReason.Other,
}: {
  children?: React.ReactNode;
  billingUrl?: string | null;
  suspensionReason?: AccountSuspensionReason;
}) => {
  const { heading, message, action } =
    reasons[suspensionReason] || reasons[AccountSuspensionReason.Other];

  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>{heading}</Heading>
            <Text center muted>
              {message}
            </Text>
          </div>

          {billingUrl && (
            <Button asChild size="medium" variant="solid">
              <a href={billingUrl} target="_new">
                {action}
              </a>
            </Button>
          )}

          {children}
        </Stack>
      </Container>
    </Screen>
  );
};
