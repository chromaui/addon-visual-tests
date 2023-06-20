import React from "react";

import { aggregate, ComparisonResult } from "../constants";
import { ArrowIcon } from "./icons/ArrowIcon";
import { ChromeIcon } from "./icons/ChromeIcon";
import { EdgeIcon } from "./icons/EdgeIcon";
import { FirefoxIcon } from "./icons/FirefoxIcon";
import { SafariIcon } from "./icons/SafariIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

const supportedBrowsers = {
  chrome: { title: "Chrome", icon: <ChromeIcon alt="Chrome" /> },
  firefox: { title: "Firefox", icon: <FirefoxIcon alt="Firefox" /> },
  safari: { title: "Safari", icon: <SafariIcon alt="Safari" /> },
  edge: { title: "Edge", icon: <EdgeIcon alt="Edge" /> },
} as const;

type Browser = keyof typeof supportedBrowsers;

interface BrowserSelectorProps {
  browserResults: Record<string, ComparisonResult>;
  onSelectBrowser: (browser: string) => void;
}

export const BrowserSelector = ({ browserResults, onSelectBrowser }: BrowserSelectorProps) => {
  const [selected, setSelected] = React.useState(Object.keys(browserResults)[0]);

  const handleSelect = React.useCallback(
    (browser: string) => {
      setSelected(browser);
      onSelectBrowser(browser);
    },
    [onSelectBrowser]
  );

  const links = Object.entries(browserResults)
    .filter(([browser]) => browser in supportedBrowsers)
    .map(([browser, status]) => ({
      active: selected === browser,
      id: browser,
      onClick: () => handleSelect(browser),
      right: status !== ComparisonResult.EQUAL && <StatusDot status={status} />,
      title: supportedBrowsers[browser as Browser].title,
    }));

  const status = aggregate(Object.values(browserResults));

  return (
    <TooltipMenu placement="bottom" links={links}>
      {status === ComparisonResult.EQUAL ? (
        supportedBrowsers[selected as Browser].icon
      ) : (
        <StatusDotWrapper status={status}>
          {supportedBrowsers[selected as Browser].icon}
        </StatusDotWrapper>
      )}
      <ArrowIcon icon="arrowdown" />
    </TooltipMenu>
  );
};
