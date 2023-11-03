import React from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { FooterMenu } from "../../components/FooterMenu";
import { Bar, Col, Section } from "../../components/layout";
import { ModeSelector } from "../../components/ModeSelector";
import { TestStatus } from "../../gql/graphql";
import { useSelectedStoryState } from "./BuildContext";

export const BuildResultsFooter = ({
  setAccessToken,
}: {
  setAccessToken: (token: string | null) => void;
}) => {
  const storyState = useSelectedStoryState();
  const { browserResults, modeResults } = storyState.summary;

  return (
    <Section>
      <Bar>
        {modeResults.length > 0 && (
          <ModeSelector
            isAccepted={storyState.summary.status === TestStatus.Accepted}
            selectedMode={storyState.selectedTest.mode}
            modeResults={modeResults}
            onSelectMode={storyState.onSelectMode}
          />
        )}
        {browserResults.length > 0 && (
          <BrowserSelector
            isAccepted={storyState.summary.status === TestStatus.Accepted}
            selectedBrowser={storyState.selectedComparison.browser}
            browserResults={browserResults}
            onSelectBrowser={storyState.onSelectBrowser}
          />
        )}
        {/* <Col push>
        <WithTooltip
          tooltip={<TooltipNote note="Render settings" />}
          trigger="hover"
          hasChrome={false}
        >
          <IconButton
            active={settingsVisible}
            aria-label={`${settingsVisible ? "Hide" : "Show"} render settings`}
            onClick={() => {
              setSettingsVisible(!settingsVisible);
              setWarningsVisible(false);
            }}
          >
            <Icons icon="controls" />
          </IconButton>
        </WithTooltip>
      </Col> */}
        {/* <Col>
        <WithTooltip
          tooltip={<TooltipNote note="View warnings" />}
          trigger="hover"
          hasChrome={false}
        >
          <IconButton
            active={warningsVisible}
            aria-label={`${warningsVisible ? "Hide" : "Show"} warnings`}
            onClick={() => {
              setWarningsVisible(!warningsVisible);
              setSettingsVisible(false);
            }}
            status="warning"
          >
            <Icons icon="alert" />2
          </IconButton>
        </WithTooltip>
      </Col> */}
        <Col push>
          <FooterMenu setAccessToken={setAccessToken} />
        </Col>
      </Bar>
    </Section>
  );
};
