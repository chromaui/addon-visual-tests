import React from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { FooterMenu } from "../../components/FooterMenu";
import { Bar, Col, Section } from "../../components/layout";
import { ModeSelector } from "../../components/ModeSelector";
import { TestStatus } from "../../gql/graphql";
import { useSelectedStoryState } from "./BuildContext";

export const BuildResultsFooter = ({
  setAccessToken,
  projectId,
}: {
  setAccessToken: (token: string | null) => void;
  projectId: string;
}) => {
  const storyState = useSelectedStoryState();
  const { browserResults, modeResults } = storyState.summary;

  return (
    <Section last>
      <Bar>
        {modeResults.length > 0 && (
          <ModeSelector
            isAccepted={storyState.summary.status === TestStatus.Accepted}
            modeOrder={storyState.modeOrder}
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
            <ControlsIcon />
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
            <AlertIcon />2
          </IconButton>
        </WithTooltip>
      </Col> */}
        <Col push>
          <FooterMenu setAccessToken={setAccessToken} projectId={projectId} />
        </Col>
      </Bar>
    </Section>
  );
};
