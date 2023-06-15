import { TooltipLinkList, WithTooltip } from "@storybook/components";
import React, { ComponentProps } from "react";

import { IconButton } from "./IconButton";
import { styled } from "@storybook/theming";

interface TooltipMenuProps
  extends Omit<ComponentProps<typeof WithTooltip>, "children" | "tooltip" | "onVisibleChange"> {
  children: React.ReactNode | ((active: boolean) => React.ReactNode);
  links: ComponentProps<typeof TooltipLinkList>["links"];
}

const Tooltip = styled.div({
  "& > div": {
    minWidth: 120,
  },
});

export const TooltipMenu = ({ children, links, ...props }: TooltipMenuProps) => {
  const [active, setActive] = React.useState(false);

  return (
    <WithTooltip
      closeOnOutsideClick
      closeOnTriggerHidden
      onVisibleChange={(visible) => setActive(visible)}
      tooltip={
        <Tooltip>
          <TooltipLinkList links={links} />
        </Tooltip>
      }
      trigger="click"
      withArrows
      {...props}
    >
      {typeof children === "function" ? (
        children(active)
      ) : (
        <IconButton as="div" active={active}>
          {children}
        </IconButton>
      )}
    </WithTooltip>
  );
};
