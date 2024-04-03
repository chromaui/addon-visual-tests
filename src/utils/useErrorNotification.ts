import { useStorybookApi } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import { useCallback } from "react";

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
        id: `${ADDON_ID}/error`,
        content: {
          headline,
          subHeadline: err.toString(),
        },
        icon: {
          name: "failed",
          color: color.negative,
        },
        onClick: clickNotification,
      });
    },
    [addNotification, clickNotification]
  );
}
