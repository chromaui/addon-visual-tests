import { TooltipLinkList, TooltipNote, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { IconButton } from "./IconButton";

const Tooltip = styled.div({
  "& > div": {
    minWidth: 120,
  },
});

interface TooltipMenuProps
  extends Omit<ComponentProps<typeof WithTooltip>, "children" | "tooltip" | "onVisibleChange"> {
  children: React.ReactNode | ((active: boolean) => React.ReactNode);
  links: ComponentProps<typeof TooltipLinkList>["links"];
  note?: ComponentProps<typeof TooltipNote>["note"];
}

export const TooltipMenu = ({ children, links, note, ...props }: TooltipMenuProps) => {
  const [active, setActive] = React.useState(false);

  const menu = (
    <WithTooltip
      closeOnOutsideClick
      closeOnTriggerHidden
      onVisibleChange={(visible) => setActive(visible)}
      tooltip={({ onHide }) => (
        <Tooltip>
          <TooltipLinkList
            links={links.map((link) => ({
              ...link,
              onClick: (...args) => {
                onHide();
                return link.onClick?.(...args);
              },
            }))}
          />
        </Tooltip>
      )}
      trigger="click"
      {...props}
    >
      {typeof children === "function" ? (
        children(active)
      ) : (
        <IconButton active={active}>{children}</IconButton>
      )}
    </WithTooltip>
  );

  if (note) {
    return (
      <WithTooltip tooltip={<TooltipNote note={note} />} trigger="hover" hasChrome={false}>
        {menu}
      </WithTooltip>
    );
  }

  return menu;
};
