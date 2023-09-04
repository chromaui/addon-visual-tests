import React from "react";

import { Browser, BrowserInfo, ComparisonResult, TestStatus } from "../gql/graphql";
import { aggregateResult } from "../utils/aggregateResult";
import { ArrowIcon } from "./icons/ArrowIcon";
import { ChromeIcon } from "./icons/ChromeIcon";
import { EdgeIcon } from "./icons/EdgeIcon";
import { FirefoxIcon } from "./icons/FirefoxIcon";
import { SafariIcon } from "./icons/SafariIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

const browserIcons = {
  [Browser.Chrome]: <ChromeIcon alt="Chrome" aria-label="Chrome" />,
  [Browser.Firefox]: <FirefoxIcon alt="Firefox" aria-label="Firefox" />,
  [Browser.Safari]: <SafariIcon alt="Safari" aria-label="Safari" />,
  [Browser.Edge]: <EdgeIcon alt="Edge" aria-label="Edge" />,
} as const;

type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;

interface BrowserSelectorProps {
  testStatus: TestStatus;
  selectedBrowser: BrowserData;
  browserResults: { browser: BrowserData; result: ComparisonResult }[];
  onSelectBrowser: (browser: BrowserData) => void;
}

export const BrowserSelector = ({
  testStatus,
  selectedBrowser,
  browserResults,
  onSelectBrowser,
}: BrowserSelectorProps) => {
  const links = browserResults
    .filter(({ browser }) => browser.key in browserIcons)
    .map(({ browser, result }) => ({
      active: selectedBrowser === browser,
      id: browser.id,
      onClick: () => onSelectBrowser(browser),
      right: testStatus !== TestStatus.Accepted && result !== ComparisonResult.Equal && (
        <StatusDot status={result} />
      ),
      title: browser.name,
    }));

  const aggregate = aggregateResult(browserResults.map(({ result }) => result));
  if (!aggregate) return null;

  const icon = browserIcons[selectedBrowser.key];
  return (
    <TooltipMenu placement="bottom" links={links}>
      {testStatus === TestStatus.Accepted || aggregate === ComparisonResult.Equal ? (
        icon
      ) : (
        <StatusDotWrapper status={aggregate}>{icon}</StatusDotWrapper>
      )}
      <ArrowIcon icon="arrowdown" />
    </TooltipMenu>
  );
};
