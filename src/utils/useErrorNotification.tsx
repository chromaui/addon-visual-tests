import { FailedIcon } from "@storybook/icons";
import React, { useCallback } from "react";
import { useStorybookApi } from "storybook/internal/manager-api";
import { color } from "storybook/internal/theming";

import { ADDON_ID, PANEL_ID } from "../constants";

export function useErrorNotification() {
  const api = useStorybookApi();

  const { addNotification, setOptions, togglePanel } = api;
  const clickNotification = useCallback(
    ({ onDismiss }) => {
      onDismiss();
      setOptions({ selectedPanel: PANEL_ID });
      togglePanel(true);
    },
    [setOptions, togglePanel]
  );

  return useCallback(
    (headline: string, err: any) => {
      addNotification({
        id: `${ADDON_ID}/error/${Date.now()}`,
        content: {
          headline,
          subHeadline: err.toString(),
        },
        icon: <FailedIcon color={color.negative} />,
        onClick: clickNotification,
      });
    },
    [addNotification, clickNotification]
  );
}
