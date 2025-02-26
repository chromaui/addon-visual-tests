import React from "react";
import { addons, type API } from "storybook/internal/manager-api";
import { type Addon_TestProviderType, Addon_TypesEnum } from "storybook/internal/types";

import { SidebarBottom } from "./components/SidebarBottom";
import { SidebarTop } from "./components/SidebarTop";
import {
  ADDON_ID,
  PANEL_ID,
  PARAM_KEY,
  SIDEBAR_BOTTOM_ID,
  SIDEBAR_TOP_ID,
  TEST_PROVIDER_ID,
} from "./constants";
import { Panel } from "./Panel";
import { TestingModuleDescription } from "./TestingModuleDescription";

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: Addon_TypesEnum.PANEL,
    title: "Visual tests",
    paramKey: PARAM_KEY,
    match: ({ viewMode }) => viewMode === "story",
    render: ({ active }) => <Panel active={!!active} api={api} />,
  });

  if (globalThis.CONFIG_TYPE !== "DEVELOPMENT") {
    return;
  }

  if (Addon_TypesEnum.experimental_TEST_PROVIDER) {
    addons.add(TEST_PROVIDER_ID, {
      type: Addon_TypesEnum.experimental_TEST_PROVIDER,
      runnable: true,
      name: "Visual tests",
      title: ({ failed }) => (failed ? "Visual tests didn't complete" : "Visual tests"),
      description: (state) => <TestingModuleDescription {...state} api={api} />,
    } as Addon_TestProviderType);
  } else {
    addons.add(SIDEBAR_TOP_ID, {
      type: "sidebar-top" as Addon_TypesEnum.experimental_SIDEBAR_TOP,
      render: () => <SidebarTop api={api} />,
    });

    addons.add(SIDEBAR_BOTTOM_ID, {
      type: "sidebar-bottom" as Addon_TypesEnum.experimental_SIDEBAR_BOTTOM,
      render: () => <SidebarBottom api={api} />,
    });
  }
});
