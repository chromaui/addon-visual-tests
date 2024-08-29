import { FailedIcon } from "@storybook/icons";
import { addons, type API } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import { Addon_TypesEnum } from "@storybook/types";
import React from "react";

import { SidebarBottom } from "./components/SidebarBottom";
import { SidebarTop } from "./components/SidebarTop";
import { ADDON_ID, PANEL_ID, PARAM_KEY, SIDEBAR_BOTTOM_ID, SIDEBAR_TOP_ID } from "./constants";
import { Panel } from "./Panel";

let heartbeatTimeout: NodeJS.Timeout;
const expectHeartbeat = (api: API) => {
  heartbeatTimeout = setTimeout(() => expectHeartbeat(api), 30000);
};

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: Addon_TypesEnum.PANEL,
    title: "Visual Tests",
    paramKey: PARAM_KEY,
    match: ({ viewMode }) => viewMode === "story",
    render: ({ active }) => <Panel active={!!active} api={api} />,
  });

  addons.add(SIDEBAR_TOP_ID, {
    type: Addon_TypesEnum.experimental_SIDEBAR_TOP,
    render: () => <SidebarTop api={api} />,
  });

  addons.add(SIDEBAR_BOTTOM_ID, {
    type: Addon_TypesEnum.experimental_SIDEBAR_BOTTOM,
    render: () => <SidebarBottom api={api} />,
  });

  const channel = api.getChannel();
  if (!channel) return;

  let notificationId: string | undefined;
  channel.on(`${ADDON_ID}/heartbeat`, () => {
    clearTimeout(heartbeatTimeout);
    if (notificationId) {
      api.clearNotification(notificationId);
      notificationId = undefined;
    }
    heartbeatTimeout = setTimeout(() => {
      notificationId = `${ADDON_ID}/connection-lost/${Date.now()}`;
      api.addNotification({
        id: notificationId,
        content: {
          headline: "Connection lost",
          subHeadline: "Lost connection to the Storybook server. Try refreshing the page.",
        },
        icon: <FailedIcon color={color.negative} />,
        // @ts-expect-error SB needs a proper API for no link
        link: undefined,
      });
    }, 3000);
  });
});
