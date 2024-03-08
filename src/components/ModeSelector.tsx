import { TooltipNote, WithTooltip } from "@storybook/components";
import { ChevronDownIcon, DiamondIcon } from "@storybook/icons";
import { styled, useTheme } from "@storybook/theming";
import React from "react";

import { ComparisonResult, TestMode } from "../gql/graphql";
import { aggregateResult } from "../utils/aggregateResult";
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
    path: {
      fill: theme.base === "light" ? `${theme.color.defaultText}99` : theme.color.light,
    },
  },
}));

const Label = styled.span(({ theme }) => ({
  display: "none",
  fontSize: theme.typography.size.s1,
  "@container (min-width: 300px)": {
    display: "inline-block",
  },
  color: theme.base === "light" ? `${theme.color.defaultText}99` : theme.color.light,
}));

type ModeData = Pick<TestMode, "name">;

interface ModeSelectorProps {
  isAccepted: boolean;
  modeOrder?: string[];
  modeResults: { mode: ModeData; result?: ComparisonResult }[];
  onSelectMode: (mode: ModeData) => void;
  selectedMode: ModeData;
}

export const ModeSelector = ({
  isAccepted,
  modeOrder,
  modeResults,
  onSelectMode,
  selectedMode,
}: ModeSelectorProps) => {
  const theme = useTheme();
  const aggregate = aggregateResult(modeResults.map(({ result }) => result));
  if (!aggregate) return null;

  let icon = (
    <DiamondIcon
      color={theme.base === "light" ? `${theme.color.defaultText}99` : theme.color.light}
    />
  );
  if (!isAccepted && aggregate !== ComparisonResult.Equal && modeResults.length >= 2) {
    icon = <StatusDotWrapper status={aggregate}>{icon}</StatusDotWrapper>;
  }

  const links =
    modeResults.length > 1 &&
    modeResults
      .map(({ mode, result }) => ({
        id: mode.name,
        title: mode.name,
        right: !isAccepted && result !== ComparisonResult.Equal && <StatusDot status={result} />,
        onClick: () => onSelectMode(mode),
        active: selectedMode.name === mode.name,
      }))
      .sort((a, b) => {
        if (!modeOrder) return 0;
        const ia = modeOrder.indexOf(a.title);
        const ib = modeOrder.indexOf(b.title);
        return ia !== -1 && ib !== -1 ? ia - ib : 0;
      });

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
          <ChevronDownIcon style={{ width: 10, height: 10 }} />
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
