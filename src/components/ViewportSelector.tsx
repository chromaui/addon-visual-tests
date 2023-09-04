import { TooltipNote, WithTooltip } from "@storybook/components";
import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React from "react";

import { ComparisonResult, ViewportInfo } from "../gql/graphql";
import { aggregateResult } from "../utils/aggregateResult";
import { ArrowIcon } from "./icons/ArrowIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

const IconWrapper = styled.div(({ theme }) => ({
  height: 14,
  margin: "7px 7px",
  color: `${theme.color.defaultText}99`,
  svg: {
    verticalAlign: "top",
  },
}));

type ViewportData = Pick<ViewportInfo, "id" | "name">;

interface ViewportSelectorProps {
  isAccepted: boolean;
  selectedViewport: ViewportData;
  onSelectViewport: (viewport: ViewportData) => void;
  viewportResults: { viewport: ViewportData; result: ComparisonResult }[];
}

export const ViewportSelector = ({
  isAccepted,
  selectedViewport,
  viewportResults,
  onSelectViewport,
}: ViewportSelectorProps) => {
  const aggregate = aggregateResult(viewportResults.map(({ result }) => result));
  if (!aggregate) return null;

  let icon = <Icon icon="grow" />;
  if (!isAccepted && aggregate !== ComparisonResult.Equal) {
    icon = <StatusDotWrapper status={aggregate}>{icon}</StatusDotWrapper>;
  }

  const links = viewportResults.map(({ viewport, result }) => ({
    id: viewport.id,
    title: viewport.name,
    right: !isAccepted && result !== ComparisonResult.Equal && <StatusDot status={result} />,
    onClick: () => onSelectViewport(viewport),
    active: selectedViewport === viewport,
  }));

  return (
    <WithTooltip
      hasChrome={false}
      placement="top"
      trigger="hover"
      tooltip={
        <TooltipNote
          note={
            links.length === 1 ? `Tested at ${viewportResults[0].viewport.name}` : "Switch viewport"
          }
        />
      }
    >
      {links.length === 1 ? (
        <IconWrapper>{icon}</IconWrapper>
      ) : (
        <TooltipMenu placement="bottom" links={links}>
          {icon}
          {selectedViewport.name}
          <ArrowIcon icon="arrowdown" />
        </TooltipMenu>
      )}
    </WithTooltip>
  );
};
