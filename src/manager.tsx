import { addons, types } from "@storybook/manager-api";
import React from "react";

import { ADDON_ID, PANEL_ID, SIDEBAR_BOTTOM_ID, TOOL_ID } from "./constants";
import { Panel } from "./Panel";
import { SidebarBottom } from "./SidebarBottom";
import { Tool } from "./Tool";

addons.register(ADDON_ID, (api) => {
  addons.add(TOOL_ID, {
    type: types.experimental_SIDEBAR_TOP,
    render: Tool,
  });

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "Visual Tests",
    match: ({ viewMode }) => viewMode === "story",
    render: ({ active }) => <Panel active={active} api={api} />,
  });

  addons.add(SIDEBAR_BOTTOM_ID, {
    type: types.experimental_SIDEBAR_BOTTOM,
    render: () => <SidebarBottom api={api} />,
  });
});
