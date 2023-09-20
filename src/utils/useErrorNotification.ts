import { useStorybookApi } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import { useCallback } from "react";

import { ADDON_ID } from "../constants";

export function useErrorNotification() {
  const api = useStorybookApi();

  const { addNotification } = api;
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
        // @ts-expect-error SB needs a proper API for no link
        link: undefined,
      });
    },
    [addNotification]
  );
}
