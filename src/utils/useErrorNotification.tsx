import { FailedIcon } from "@storybook/icons";
import { useStorybookApi } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import React, { useCallback } from "react";

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
        icon: <FailedIcon color={color.negative} />,
        // @ts-expect-error `duration` and `onClick` require a newer version of Storybook
        onClick: clickNotification,
      });
    },
    [addNotification, clickNotification]
  );
}
