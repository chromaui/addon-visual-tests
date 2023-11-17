import { TooltipNote, WithTooltip } from "@storybook/components";
import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React from "react";

import { ComparisonResult, TestMode } from "../gql/graphql";
import { aggregateResult } from "../utils/aggregateResult";
import { ArrowIcon } from "./icons/ArrowIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

const IconWrapper = styled.div(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 14,
  margin: "7px 7px",
  color: `${theme.color.defaultText}99`,
  svg: {
    verticalAlign: "top",
  },
}));

const Label = styled.span({
  display: "none",
  "@container (min-width: 300px)": {
    display: "inline-block",
  },
});

type ModeData = Pick<TestMode, "name">;

interface ModeSelectorProps {
  isAccepted: boolean;
  selectedMode: ModeData;
  onSelectMode: (mode: ModeData) => void;
  modeResults: { mode: ModeData; result?: ComparisonResult }[];
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

  const links =
    modeResults.length > 1 &&
    modeResults.map(({ mode, result }) => ({
      id: mode.name,
      title: mode.name,
      right: !isAccepted && result !== ComparisonResult.Equal && <StatusDot status={result} />,
      onClick: () => onSelectMode(mode),
      active: selectedMode.name === mode.name,
    }));

  return (
    <WithTooltip
      key={selectedMode.name}
      hasChrome={false}
      placement="top"
      trigger="hover"
      tooltip={
        <TooltipNote note={links ? "Switch mode" : `View mode: ${modeResults[0].mode.name}`} />
      }
    >
      {links ? (
        <TooltipMenu placement="bottom" links={links}>
          {icon}
          <Label>{selectedMode.name}</Label>
          <ArrowIcon icon="arrowdown" />
        </TooltipMenu>
      ) : (
        <IconWrapper>
          {icon}
          <Label>{selectedMode.name}</Label>
        </IconWrapper>
      )}
    </WithTooltip>
  );
};
