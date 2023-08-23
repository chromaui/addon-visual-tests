import { Badge as BaseBadge } from "@storybook/components";
import { type API, useStorybookState } from "@storybook/manager-api";
import { css, styled } from "@storybook/theming";
import type { API_FilterFunction } from "@storybook/types";
import pluralize from "pluralize";
import React, { useState } from "react";

import { IconButton } from "./components/IconButton";
import { ADDON_ID } from "./constants";

const Badge = styled(BaseBadge)(({ theme }) => ({
  padding: "4px 8px",
  fontSize: theme.typography.size.s1,
}));

const Button = styled(IconButton)(
  {
    "&:hover [data-badge], [data-badge=true]": {
      background: "#E3F3FF",
      borderColor: "rgba(2, 113, 182, 0.1)",
      color: "#0271B6",
    },
  },
  ({ active, theme }) =>
    !active &&
    css({
      "&:hover": {
        color: theme.color.defaultText,
      },
    })
);

const filterNone: API_FilterFunction = () => true;
const filterWarn: API_FilterFunction = ({ status }) => status?.[ADDON_ID]?.status === "warn";

interface ToggleButtonProps {
  api: API;
  count: number;
}

const ToggleButton = React.memo(function ToggleButton({ api, count }: ToggleButtonProps) {
  const [filter, setFilter] = useState(false);

  const toggleFilter = () => {
    setFilter(!filter);
    api.experimental_setFilter(ADDON_ID, filter ? filterNone : filterWarn);
  };

  return (
    <Button active={filter} onClick={toggleFilter}>
      <Badge status="warning" data-badge={filter}>
        {count}
      </Badge>
      <span>{pluralize("Change", count)}</span>
    </Button>
  );
});

interface SidebarBottomProps {
  api: API;
}

export const SidebarBottom = ({ api }: SidebarBottomProps) => {
  const { status } = useStorybookState();
  const warnings = Object.values(status).filter((value) => value[ADDON_ID]?.status === "warn");
  return warnings.length ? <ToggleButton api={api} count={warnings.length} /> : null;
};
