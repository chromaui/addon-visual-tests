import { Badge as BaseBadge } from "@storybook/components";
import { css, styled } from "@storybook/theming";
import pluralize from "pluralize";
import React, { useEffect, useState } from "react";

import { IconButton } from "./IconButton";

const Badge = styled(BaseBadge)(({ theme }) => ({
  padding: "4px 8px",
  fontSize: theme.typography.size.s1,
}));

const Button = styled(IconButton)(
  ({ theme }) => ({
    fontSize: theme.typography.size.s1,
    "&:hover [data-badge], [data-badge=true]": {
      background: "#E3F3FF",
      borderColor: "rgba(2, 113, 182, 0.1)",
      color: "#0271B6",
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
  count: number;
  onEnable: () => void;
  onDisable: () => void;
}

export const SidebarToggleButton = React.memo(function SidebarToggleButton({
  count,
  onEnable,
  onDisable,
}: SidebarToggleButtonProps) {
  const [filter, setFilter] = useState(false);

  const toggleFilter = () => {
    setFilter(!filter);
    if (filter) onDisable();
    else onEnable();
  };

  // Ensure the filter is disabled if the button is not visible
  useEffect(() => () => onDisable(), [onDisable]);

  return (
    <Button id="changes-found-filter" active={filter} onClick={toggleFilter}>
      <Badge status="warning" data-badge={filter}>
        {count}
      </Badge>
      <Label>{pluralize("Change", count)}</Label>
    </Button>
  );
});
