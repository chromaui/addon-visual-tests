import React, { createContext, ReactNode } from "react";

import { REMOVE_ADDON } from "../../constants";
import { useRequiredContext } from "../../utils/useRequiredContext";
import { useSharedState } from "../../utils/useSharedState";
import { useStorybookApi } from "@storybook/manager-api";

const UninstallContext = createContext<
  { addonUninstalled: boolean | undefined; uninstallAddon: () => void } | undefined
>(undefined);

export const UninstallProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const channel = useStorybookApi().getChannel();
  if (!channel) throw new Error("Channel not available");
  const [addonUninstalled, setAddonUninstalled] = useSharedState<boolean>(REMOVE_ADDON);
  const uninstallAddon = () => {
    channel.emit(REMOVE_ADDON);
    setAddonUninstalled(true);
  };

  return (
    <UninstallContext.Provider value={{ addonUninstalled, uninstallAddon }}>
      {children}
    </UninstallContext.Provider>
  );
};

export const useUninstallAddon = () => useRequiredContext(UninstallContext, "Uninstall Addon");
