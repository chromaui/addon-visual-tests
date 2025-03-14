import React, { ComponentProps } from 'react';
import { TooltipLinkList, WithTooltip } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { IconButton } from './IconButton';
import { TooltipNote } from './TooltipNote';

const TooltipWrapper = styled.div({
  '& > div': {
    minWidth: 120,
  },
});

interface TooltipMenuProps
  extends Omit<ComponentProps<typeof WithTooltip>, 'children' | 'tooltip' | 'onVisibleChange'> {
  children: React.ReactNode | ((active: boolean) => React.ReactNode);
  links: ComponentProps<typeof TooltipLinkList>['links'];
  note?: ComponentProps<typeof TooltipNote>['note'];
}

function mapLinks(onClick: () => void) {
  return (
    link: ComponentProps<typeof TooltipLinkList>['links'][number]
  ): ComponentProps<typeof TooltipLinkList>['links'][number] => {
    if (Array.isArray(link)) {
      return link.map(mapLinks(onClick)) as ComponentProps<typeof TooltipLinkList>['links'][number];
    }

    if ('onClick' in link && typeof link.onClick === 'function') {
      return {
        ...link,
        onClick: (...args: unknown[]) => {
          onClick();
          // @ts-ignore (too complex to type, due to multiple types of links and it being in an array of arrays)
          link.onClick?.(...args);
        },
      };
    }
    return link;
  };
}

export const TooltipMenu = ({ children, links, note, ...props }: TooltipMenuProps) => {
  const [active, setActive] = React.useState(false);

  const menu = (
    <WithTooltip
      closeOnOutsideClick
      closeOnTriggerHidden
      onVisibleChange={(visible) => setActive(visible)}
      tooltip={({ onHide }) => (
        <TooltipWrapper>
          <TooltipLinkList
            links={links.map(mapLinks(onHide)) as ComponentProps<typeof TooltipLinkList>['links']}
          />
        </TooltipWrapper>
      )}
      trigger="click"
      {...props}
    >
      {typeof children === 'function' ? (
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
