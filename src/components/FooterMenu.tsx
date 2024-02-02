import { EllipsisIcon, QuestionIcon, UserIcon } from "@storybook/icons";
import React from "react";

import { TooltipMenu } from "./TooltipMenu";

interface FooterMenuProps {
  setAccessToken: (value: string | null) => void;
}

export const FooterMenu = ({ setAccessToken }: FooterMenuProps) => {
  return (
    <TooltipMenu
      placement="top"
      links={[
        {
          id: "logout",
          title: "Log out",
          icon: <UserIcon />,
          onClick: () => setAccessToken(null),
        },
        {
          id: "learn",
          title: "Learn about this addon",
          icon: <QuestionIcon />,
          href: "https://www.chromatic.com/docs/visual-testing-addon",
        },
      ]}
    >
      <EllipsisIcon />
    </TooltipMenu>
  );
};
