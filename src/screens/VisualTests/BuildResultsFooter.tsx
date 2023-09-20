import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import React from "react";

import { FooterMenu } from "../../components/FooterMenu";
import { IconButton } from "../../components/IconButton";
import { Bar, Col, Section, Sections, Text } from "../../components/layout";
import { SelectedBuildFieldsFragment } from "../../gql/graphql";

export const BuildResultsFooter = ({
  hasBaselineSnapshot,
  setAccessToken,
  baselineImageVisible,
  toggleBaselineImage,
  selectedBuild,
  setWarningsVisible,
  warningsVisible,
  setSettingsVisible,
  settingsVisible,
}: {
  hasBaselineSnapshot: boolean;
  setAccessToken: (token: string | null) => void;
  baselineImageVisible: boolean;
  toggleBaselineImage: () => void;
  selectedBuild: SelectedBuildFieldsFragment;
  setWarningsVisible: (visible: boolean) => void;
  warningsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
  settingsVisible: boolean;
}) => (
  <Section>
    <Bar>
      {hasBaselineSnapshot && (
        <Col>
          <WithTooltip
            tooltip={<TooltipNote note="Switch snapshot" />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton data-testid="button-toggle-snapshot" onClick={() => toggleBaselineImage()}>
              <Icons icon="transfer" />
            </IconButton>
          </WithTooltip>
        </Col>
      )}
      <Col style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
        {baselineImageVisible ? (
          <Text style={{ marginLeft: 5, width: "100%" }}>
            <b>Baseline</b> Build {selectedBuild.number} on {selectedBuild.branch}
          </Text>
        ) : (
          <Text style={{ marginLeft: 5, width: "100%" }}>
            <b>Latest</b> Build {selectedBuild.number} on {selectedBuild.branch}
          </Text>
        )}
      </Col>
      <Col push>
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
      </Col>
      <Col>
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
      </Col>
      <Col push>
        <FooterMenu setAccessToken={setAccessToken} />
      </Col>
    </Bar>
  </Section>
);
