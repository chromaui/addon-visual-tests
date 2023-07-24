import { Icon } from "@storybook/design-system";
import React from "react";

import { ComparisonResult, ViewportInfo } from "../gql/graphql";
import { aggregateResult } from "../utils/aggregateResult";
import { ArrowIcon } from "./icons/ArrowIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

type ViewportData = Pick<ViewportInfo, "id" | "name">;

interface ViewportSelectorProps {
  selectedViewport: ViewportData;
  onSelectViewport: (viewport: ViewportData) => void;
  viewportResults: { viewport: ViewportData; result: ComparisonResult }[];
}

export const ViewportSelector = ({
  selectedViewport,
  viewportResults,
  onSelectViewport,
}: ViewportSelectorProps) => {
  const aggregate = aggregateResult(viewportResults.map(({ result }) => result));
  if (!aggregate) return null;

  return (
    <TooltipMenu
      placement="bottom"
      links={viewportResults.map(({ viewport, result }) => ({
        id: viewport.id,
        title: viewport.name,
        right: result !== ComparisonResult.Equal && <StatusDot status={result} />,
        onClick: () => onSelectViewport(viewport),
        active: selectedViewport === viewport,
      }))}
    >
      {aggregate === ComparisonResult.Equal ? (
        <Icon icon="grow" />
      ) : (
        <StatusDotWrapper status={aggregate}>
          <Icon icon="grow" />
        </StatusDotWrapper>
      )}
      {selectedViewport.name}
      <ArrowIcon icon="arrowdown" />
    </TooltipMenu>
  );
};
