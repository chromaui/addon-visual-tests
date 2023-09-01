import { Icon } from "@storybook/design-system";
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
          href: "https://www.chromatic.com/docs/visual-testing-addon",
        },
      ]}
    >
      <Icon icon="ellipsis" />
    </TooltipMenu>
  );
};
