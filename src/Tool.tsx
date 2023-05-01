import React, { memo, useCallback, useEffect } from "react";
import { useGlobals, useStorybookApi } from "@storybook/manager-api";
import { Icons, IconButton } from "@storybook/components";
import { ADDON_ID, PARAM_KEY, TOOL_ID } from "./constants";

export const Tool = memo(function MyAddonSelector() {
  const [globals, updateGlobals] = useGlobals();
  const api = useStorybookApi();

  const isActive = [true, "true"].includes(globals[PARAM_KEY]);

  const toggleMyTool = useCallback(() => {
    updateGlobals({
      [PARAM_KEY]: !isActive,
    });
  }, [isActive]);

  useEffect(() => {
    api.setAddonShortcut(ADDON_ID, {
      label: "Toggle Measure [O]",
      defaultShortcut: ["O"],
      actionName: "outline",
      showInMenu: false,
      action: toggleMyTool,
    });
  }, [toggleMyTool, api]);

  return (
    <IconButton
      key={TOOL_ID}
      active={isActive}
      title="Enable my addon"
      onClick={toggleMyTool}
    >
      <Icons icon="lightning" />
    </IconButton>
  );
});
