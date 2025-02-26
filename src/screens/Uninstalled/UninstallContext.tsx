import React, { createContext, ReactNode } from "react";
import { useStorybookApi } from "storybook/internal/manager-api";

import { REMOVE_ADDON } from "../../constants";
import { useRequiredContext } from "../../utils/useRequiredContext";

const UninstallContext = createContext<
  { addonUninstalled: boolean | undefined; uninstallAddon: () => void } | undefined
>(undefined);

export const UninstallProvider = ({
  children,
  addonUninstalled,
  setAddonUninstalled,
}: {
  children: ReactNode;
  addonUninstalled: boolean | undefined;
  setAddonUninstalled: (value: boolean) => void;
}) => {
  const channel = useStorybookApi().getChannel();
  if (!channel) throw new Error("Channel not available");
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
