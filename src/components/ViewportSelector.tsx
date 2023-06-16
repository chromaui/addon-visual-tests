import { Icon } from "@storybook/design-system";
import React from "react";

import { aggregate, TestStatus } from "../constants";
import { ArrowIcon } from "./icons/ArrowIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

interface ViewportSelectorProps {
  viewportStatuses: Record<string, TestStatus>;
  onSelectViewport: (viewport: string) => void;
}

export const ViewportSelector = ({ viewportStatuses, onSelectViewport }: ViewportSelectorProps) => {
  const [selected, setSelected] = React.useState(Object.keys(viewportStatuses)[0]);

  const handleSelect = React.useCallback(
    (viewport: string) => {
      setSelected(viewport);
      onSelectViewport(viewport);
    },
    [onSelectViewport]
  );

  const status = aggregate(Object.values(viewportStatuses));

  return (
    <TooltipMenu
      placement="bottom"
      links={Object.entries(viewportStatuses).map(([viewport, status]) => ({
        id: `viewport-${viewport}`,
        title: viewport,
        right: status !== TestStatus.PASSED && <StatusDot status={status} />,
        onClick: () => handleSelect(viewport),
        active: selected === viewport,
      }))}
    >
      {status === TestStatus.PASSED ? (
        <Icon icon="grow" />
      ) : (
        <StatusDotWrapper status={status}>
          <Icon icon="grow" />
        </StatusDotWrapper>
      )}
      {selected}
      <ArrowIcon icon="arrowdown" />
    </TooltipMenu>
  );
};
