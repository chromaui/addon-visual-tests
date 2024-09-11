import { Badge as BaseBadge } from "@storybook/components";
import { css, styled } from "@storybook/theming";
import pluralize from "pluralize";
import React, { ComponentProps } from "react";

import { IconButton } from "./IconButton";

const Badge = styled(BaseBadge)(({ theme }) => ({
  padding: "4px 8px",
  fontSize: theme.typography.size.s1,
}));

const Button = styled(IconButton)(
  ({ theme }) => ({
    fontSize: theme.typography.size.s2,
    "&:hover [data-badge][data-status=warning], [data-badge=true][data-status=warning]": {
      background: "#E3F3FF",
      borderColor: "rgba(2, 113, 182, 0.1)",
      color: "#0271B6",
    },
    "&:hover [data-badge][data-status=critical], [data-badge=true][data-status=critical]": {
      background: theme.background.negative,
      boxShadow: `inset 0 0 0 1px rgba(182, 2, 2, 0.1)`,
      color: theme.color.negativeText,
    },
  }),
  ({ active, theme }) =>
    !active &&
    css({
      "&:hover": {
        color: theme.base === "light" ? theme.color.defaultText : theme.color.light,
      },
    })
);

const Label = styled.span(({ theme }) => ({
  color: theme.base === "light" ? theme.color.defaultText : theme.color.light,
}));

interface SidebarToggleButtonProps {
  active: boolean;
  count: number;
  label: string;
  status: ComponentProps<typeof Badge>["status"];
}

export const SidebarToggleButton = ({
  active,
  count,
  label,
  status,
  ...props
}: SidebarToggleButtonProps & Omit<ComponentProps<typeof Button>, "status">) => {
  return (
    <Button active={active} {...props}>
      <Badge status={status} data-badge={active} data-status={status}>
        {count}
      </Badge>
      <Label>{pluralize(label, count)}</Label>
    </Button>
  );
};
