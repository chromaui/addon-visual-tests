import React from "react";

import { Browser, BrowserInfo, ComparisonResult } from "../gql/graphql";
import { aggregateResult } from "../utils/aggregateResult";
import { ArrowIcon } from "./icons/ArrowIcon";
import { ChromeIcon } from "./icons/ChromeIcon";
import { EdgeIcon } from "./icons/EdgeIcon";
import { FirefoxIcon } from "./icons/FirefoxIcon";
import { SafariIcon } from "./icons/SafariIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

const browserIcons = {
  [Browser.Chrome]: <ChromeIcon alt="Chrome" />,
  [Browser.Firefox]: <FirefoxIcon alt="Firefox" />,
  [Browser.Safari]: <SafariIcon alt="Safari" />,
  [Browser.Edge]: <EdgeIcon alt="Edge" />,
} as const;

type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;

interface BrowserSelectorProps {
  browserResults: { browser: BrowserData; result: ComparisonResult }[];
  onSelectBrowser: (browser: BrowserData) => void;
}

export const BrowserSelector = ({ browserResults, onSelectBrowser }: BrowserSelectorProps) => {
  const [selected, setSelected] = React.useState(browserResults[0].browser);

  const handleSelect = React.useCallback(
    (browser: BrowserData) => {
      setSelected(browser);
      onSelectBrowser(browser);
    },
    [onSelectBrowser]
  );

  const links = browserResults
    .filter(({ browser }) => browser.key in browserIcons)
    .map(({ browser, result }) => ({
      active: selected === browser,
      id: browser.id,
      onClick: () => handleSelect(browser),
      right: result !== ComparisonResult.Equal && <StatusDot status={result} />,
      title: browser.name,
    }));

  const aggregate = aggregateResult(browserResults.map(({ result }) => result));
  if (!aggregate) return null;

  const icon = browserIcons[selected.key];
  return (
    <TooltipMenu placement="bottom" links={links}>
      {aggregate === ComparisonResult.Equal ? (
        icon
      ) : (
        <StatusDotWrapper status={aggregate}>{icon}</StatusDotWrapper>
      )}
      <ArrowIcon icon="arrowdown" />
    </TooltipMenu>
  );
};
