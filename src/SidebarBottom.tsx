import { type API, useStorybookState } from "@storybook/manager-api";
import type { API_FilterFunction } from "@storybook/types";
import React, { useCallback } from "react";

import { SidebarToggleButton } from "./components/SidebarToggleButton";
import { ADDON_ID } from "./constants";

const filterNone: API_FilterFunction = () => true;
const filterWarn: API_FilterFunction = ({ status }) => status?.[ADDON_ID]?.status === "warn";

interface SidebarBottomProps {
  api: API;
}

export const SidebarBottom = ({ api }: SidebarBottomProps) => {
  const onEnable = useCallback(() => api.experimental_setFilter(ADDON_ID, filterWarn), [api]);
  const onDisable = useCallback(() => api.experimental_setFilter(ADDON_ID, filterNone), [api]);

  const { status } = useStorybookState();
  const warnings = Object.values(status).filter((value) => value[ADDON_ID]?.status === "warn");
  if (!warnings.length) return null;

  return <SidebarToggleButton count={warnings.length} onEnable={onEnable} onDisable={onDisable} />;
};
