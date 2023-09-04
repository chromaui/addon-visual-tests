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

type ModeData = Pick<ViewportInfo, "id" | "name">;

interface ModeSelectorProps {
  isAccepted: boolean;
  selectedMode: ModeData;
  onSelectMode: (viewport: ModeData) => void;
  modeResults: { viewport: ModeData; result: ComparisonResult }[];
}

export const ModeSelector = ({
  isAccepted,
  selectedMode,
  modeResults,
  onSelectMode,
}: ModeSelectorProps) => {
  const aggregate = aggregateResult(modeResults.map(({ result }) => result));
  if (!aggregate) return null;

  let icon = <Icon icon="diamond" />;
  if (!isAccepted && aggregate !== ComparisonResult.Equal) {
    icon = <StatusDotWrapper status={aggregate}>{icon}</StatusDotWrapper>;
  }

  const links = modeResults.map(({ viewport, result }) => ({
    id: viewport.id,
    title: viewport.name,
    right: !isAccepted && result !== ComparisonResult.Equal && <StatusDot status={result} />,
    onClick: () => onSelectMode(viewport),
    active: selectedMode === viewport,
  }));

  return (
    <WithTooltip
      hasChrome={false}
      placement="top"
      trigger="hover"
      tooltip={
        <TooltipNote
          note={links.length === 1 ? `View mode: ${modeResults[0].viewport.name}` : "Switch mode"}
        />
      }
    >
      {links.length === 1 ? (
        <IconWrapper>{icon}</IconWrapper>
      ) : (
        <TooltipMenu placement="bottom" links={links}>
          {icon}
          {selectedMode.name}
          <ArrowIcon icon="arrowdown" />
        </TooltipMenu>
      )}
    </WithTooltip>
  );
};
