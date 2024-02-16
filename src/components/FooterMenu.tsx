import { ChangedIcon, EllipsisIcon, QuestionIcon, ShareAltIcon, UserIcon } from "@storybook/icons";
import React from "react";

import { useAuthState } from "../AuthContext";
import { PROJECT_INFO } from "../constants";
import { useUninstallAddon } from "../screens/Uninstalled/UninstallContext";
import { ProjectInfoPayload } from "../types";
import { useSharedState } from "../utils/useSharedState";
import { TooltipMenu } from "./TooltipMenu";

export const FooterMenu = () => {
  const { accessToken, setAccessToken } = useAuthState();
  const { uninstallAddon } = useUninstallAddon();
  const [projectInfo] = useSharedState<ProjectInfoPayload>(PROJECT_INFO);
  const { projectId } = projectInfo || {};
  const links = [
    {
      id: "remove",
      title: "Remove addon",
      icon: <ChangedIcon aria-hidden />,
      onClick: () => uninstallAddon(),
    },
    ...(accessToken
      ? [
          {
            id: "logout",
            title: "Log out",
            icon: <UserIcon aria-hidden />,
            onClick: () => setAccessToken(null),
          },
        ]
      : []),
    {
      id: "learn",
      title: "Learn about this addon",
      icon: <QuestionIcon aria-hidden />,
      href: "https://www.chromatic.com/docs/visual-testing-addon",
      target: "_blank",
    },
    ...(projectId
      ? [
          {
            id: "visit",
            title: "Visit project on Chromatic",
            icon: <ShareAltIcon aria-hidden />,
            href: projectId
              ? `https://www.chromatic.com/builds?appId=${projectId?.split(":")[1]}`
              : "https://www.chromatic.com/start",
            target: "_blank",
          },
        ]
      : []),
  ];
  return (
    <TooltipMenu placement="top" links={links}>
      <EllipsisIcon />
    </TooltipMenu>
  );
};
