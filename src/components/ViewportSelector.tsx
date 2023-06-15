import { Icon } from "@storybook/design-system";
import React from "react";

import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { ArrowIcon } from "./icons/ArrowIcon";
import { TestStatus } from "../types";
import { TooltipMenu } from "./TooltipMenu";

interface ViewportSelectorProps {
  status: TestStatus;
  onSelectViewport: (viewport: number) => void;
}

export const ViewportSelector = ({ status, onSelectViewport }: ViewportSelectorProps) => {
  const [selected, setSelected] = React.useState(764);

  const handleSelect = React.useCallback(
    (viewport: number) => {
      setSelected(viewport);
      onSelectViewport(viewport);
    },
    [onSelectViewport]
  );

  return (
    <TooltipMenu
      placement="bottom"
      links={[764, 1024, 1200].map((viewport: number) => ({
        id: `viewport-${viewport}`,
        title: `${viewport}px`,
        right: <StatusDot status="pending" />,
        onClick: () => handleSelect(viewport),
        active: selected === viewport,
      }))}
    >
      <StatusDotWrapper status={status}>
        <Icon icon="grow" />
      </StatusDotWrapper>
      {selected}px
      <ArrowIcon icon="arrowdown" />
    </TooltipMenu>
  );
};
