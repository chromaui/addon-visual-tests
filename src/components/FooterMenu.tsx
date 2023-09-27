import { Icons } from "@storybook/components";
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
          icon: "user",
          onClick: () => setAccessToken(null),
        },
        {
          id: "learn",
          title: "Learn about this addon",
          icon: "question",
          href: "https://gist.github.com/tmeasday/d8200d5b3f18c9f62bb42d61a53d2941",
        },
      ]}
    >
      <Icons icon="ellipsis" />
    </TooltipMenu>
  );
};
