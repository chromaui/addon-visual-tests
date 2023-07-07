import { Icon } from "@storybook/design-system";
import React from "react";

import { ComparisonResult, ViewportInfo } from "../gql/graphql";
import { aggregateResult } from "../utils/aggregateResult";
import { ArrowIcon } from "./icons/ArrowIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

type ViewportData = Pick<ViewportInfo, "id" | "name">;

interface ViewportSelectorProps {
  viewportResults: { viewport: ViewportData; result: ComparisonResult }[];
  onSelectViewport: (viewport: ViewportData) => void;
}

export const ViewportSelector = ({ viewportResults, onSelectViewport }: ViewportSelectorProps) => {
  const [selected, setSelected] = React.useState(viewportResults[0].viewport);

  const handleSelect = React.useCallback(
    (viewport: ViewportData) => {
      setSelected(viewport);
      onSelectViewport(viewport);
    },
    [onSelectViewport]
  );

  const aggregate = aggregateResult(viewportResults.map(({ result }) => result));
  if (!aggregate) return null;

  return (
    <TooltipMenu
      placement="bottom"
      links={viewportResults.map(({ viewport, result }) => ({
        id: viewport.id,
        title: viewport.name,
        right: result !== ComparisonResult.Equal && <StatusDot status={result} />,
        onClick: () => handleSelect(viewport),
        active: selected === viewport,
      }))}
    >
      {aggregate === ComparisonResult.Equal ? (
        <Icon icon="grow" />
      ) : (
        <StatusDotWrapper status={aggregate}>
          <Icon icon="grow" />
        </StatusDotWrapper>
      )}
      {selected.name}
      <ArrowIcon icon="arrowdown" />
    </TooltipMenu>
  );
};
