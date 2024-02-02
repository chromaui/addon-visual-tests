import { ChangedIcon, ChromaticIcon, EllipsisIcon, QuestionIcon, UserIcon } from "@storybook/icons";
import { useChannel } from "@storybook/manager-api";
import React from "react";

import { REMOVE_ADDON } from "../constants";
import { useProjectId } from "../utils/useProjectId";
import { TooltipMenu } from "./TooltipMenu";

interface FooterMenuProps {
  setAccessToken: (value: string | null) => void;
  projectId: string;
}

export const FooterMenu = ({ setAccessToken, projectId }: FooterMenuProps) => {
  const emit = useChannel({});
  return (
    <TooltipMenu
      placement="top"
      links={[
        {
          id: "logout",
          title: "Log out",
          icon: <UserIcon aria-hidden />,
          onClick: () => setAccessToken(null),
        },
        {
          id: "learn",
          title: "Learn about this addon",
          icon: <QuestionIcon aria-hidden />,
          href: "https://www.chromatic.com/docs/visual-testing-addon",
          target: "_blank",
        },
        {
          id: "visit",
          title: "Visit Project on Chromatic",
          icon: <ChromaticIcon aria-hidden />,
          href: projectId
            ? `https://www.chromatic.com/builds?appId=${projectId?.split(":")[1]}`
            : "https://www.chromatic.com/start",
          target: "_blank",
        },
        {
          id: "remove",
          title: "Remove addon",
          icon: <ChangedIcon aria-hidden />,
          onClick: () => emit(REMOVE_ADDON),
        },
      ]}
    >
      <EllipsisIcon />
    </TooltipMenu>
  );
};
