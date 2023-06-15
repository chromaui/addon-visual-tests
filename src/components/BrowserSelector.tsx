import React from "react";

import { TestStatus } from "../types";
import { ChromeIcon } from "./icons/ChromeIcon";
import { ArrowIcon } from "./icons/ArrowIcon";
import { StatusDot, StatusDotWrapper } from "./StatusDot";
import { FirefoxIcon } from "./icons/FirefoxIcon";
import { SafariIcon } from "./icons/SafariIcon";
import { TooltipMenu } from "./TooltipMenu";

const browsers = {
  chrome: { title: "Chrome", icon: <ChromeIcon alt="Chrome" /> },
  firefox: { title: "Firefox", icon: <FirefoxIcon alt="Firefox" /> },
  safari: { title: "Safari", icon: <SafariIcon alt="Safari" /> },
} as const;

interface BrowserSelectorProps {
  status: TestStatus;
  onSelectBrowser: (browser: string) => void;
}

export const BrowserSelector = ({ status, onSelectBrowser }: BrowserSelectorProps) => {
  const [selected, setSelected] = React.useState<keyof typeof browsers>("chrome");

  const handleSelect = React.useCallback(
    (browser: keyof typeof browsers) => {
      setSelected(browser);
      onSelectBrowser(browser);
    },
    [onSelectBrowser]
  );

  return (
    <TooltipMenu
      placement="bottom"
      links={Object.keys(browsers).map((id: keyof typeof browsers) => ({
        active: selected === id,
        id,
        onClick: () => handleSelect(id),
        right: <StatusDot status="pending" />,
        title: browsers[id].title,
      }))}
    >
      <StatusDotWrapper status={status}>{browsers[selected].icon}</StatusDotWrapper>
      <ArrowIcon icon="arrowdown" />
    </TooltipMenu>
  );
};
