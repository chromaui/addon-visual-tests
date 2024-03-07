import { Link, TooltipNote, WithTooltip } from "@storybook/components";
import { AlertIcon as Alert, MarkupIcon as Markup, WandIcon as Wand } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";

import { CloseButton, CloseIcon, Heading as StyledHeading } from "../../components/Accordions";
import { Button } from "../../components/Button";
import { Code } from "../../components/Code";
import { CONFIG_INFO, CONFIG_OVERRIDES } from "../../constants";
import { ConfigInfoPayload } from "../../types";
import { useSharedState } from "../../utils/useSharedState";
import { useUninstallAddon } from "../Uninstalled/UninstallContext";

const configSchema = {
  autoAcceptChanges: {
    description: "Automatically accept visual changes - usually for a specific branch name.",
    type: "true or branch name",
  },
  buildScriptName: {
    description: "The package.json script that builds your Storybook.",
    type: "string",
  },
  cypress: {
    description: "Run build against `@chromatic-com/cypress` test archives.",
    type: "boolean",
  },
  debug: {
    description: "Output verbose logs and debug information.",
    type: "boolean",
  },
  diagnosticsFile: {
    description: "Write process information to a JSON file.",
    type: "string or boolean",
  },
  exitOnceUploaded: {
    description: "Exit the process as soon as your Storybook is published.",
    type: "string or boolean",
  },
  exitZeroOnChanges: {
    description: "Exit the process succesfully even when visual changes are found.",
    type: "string or boolean",
  },
  externals: {
    description: "Disable TurboSnap when any of these files have changed since the baseline build.",
    type: "string: ['public/**']",
  },
  fileHashing: {
    description: "Apply file hashing to skip uploading unchanged files - default: true",
    type: "boolean",
  },
  ignoreLastBuildOnBranch: {
    description:
      "Do not use the last build on this branch as a baseline if it is no longer in history (i.e. branch was rebased).",
    type: "string",
  },
  junitReport: {
    description: "Write build results to a JUnit XML file.",
    type: "string or boolean",
  },
  logFile: {
    description: "Write Chromatic CLI logs to a file.",
    type: "string or boolean",
  },
  onlyChanged: {
    description:
      "Enables TurboSnap to only run stories affected by files changed since the baseline build.",
    type: "true or string (branch name)",
    glob: true,
  },
  onlyStoryFiles: {
    description: "Only run a single story or a subset of stories by their filename(s).",
    type: "string[]",
  },
  onlyStoryNames: {
    description: "Only run a single story or a subset of stories by their name(s).",
    type: "string[]",
  },
  outputDir: {
    description:
      "Relative path to target directory for building your Storybook, in case you want to preserve it.",
    type: "string",
  },
  playwright: {
    description: "Run build against `@chromatic-com/playwright` test archives.",
    type: "boolean",
  },
  projectId: {
    description: "Unique identifier for your project. ",
    type: "string",
  },
  projectToken: {
    description:
      "Secret token for your project. Preferably configured through CHROMATIC_PROJECT_TOKEN.",
    type: "string",
  },
  skip: {
    description:
      "Skip Chromatic tests, but mark the commit as passing. Avoids blocking PRs due to required merge checks.",
    type: "string or boolean",
  },
  storybookBaseDir: {
    description: "Relative path from repository root to Storybook project root.",
    type: "string",
  },
  storybookBuildDir: {
    description: "Path to the directory of an already built Storybook.",
    type: "string",
  },
  storybookConfigDir: {
    description: "Relative path from where you run Chromatic to your Storybook config directory.",
    type: "string",
  },
  storybookLogFile: {
    description: "Write Storybook build logs to a file.",
    type: "string or boolean",
  },
  untraced: {
    description:
      "Disregard these files and their dependencies when tracing dependent stories for TurboSnap.",
    type: "string[]",
  },
  uploadMetadata: {
    description: "Upload Chromatic metadata files as part of the published Storybook.",
    type: "boolean",
  },
  zip: {
    description:
      "Publish your Storybook to Chromatic as a single zip file instead of individual content files.",
    type: "boolean",
  },
};

const StyledCloseButton = styled(CloseButton)({
  position: "absolute",
  top: 10,
  right: 16,
});

const Page = styled.div(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.background.content,
  boxShadow: `0px 1px 1px ${theme.color.border}`,
  display: "flex",
  flexDirection: "column",
  padding: 15,
}));

const PageWrapper = styled.div(({ theme }) => ({
  margin: "0 auto",
  maxWidth: 400,
  width: "100%",
}));

const PageDescription = styled.div(({ theme }) => ({
  code: {
    fontSize: "90%",
  },
}));

const Heading = styled(StyledHeading)({
  marginBottom: 10,
});

const Table = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 15,
  marginTop: 15,
}));

const Setting = styled.div(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
  padding: "10px 15px",
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: theme.appBorderRadius,

  "> div": {
    width: "100%",
  },
}));

const SettingHeading = styled.div(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "5px 10px",
}));

const SettingLabel = styled.div(({ theme }) => ({
  color: theme.base === "dark" ? theme.color.medium : theme.color.dark,
  fontSize: theme.typography.size.s1,

  div: {
    position: "relative",
    top: 2,
    marginLeft: 5,
  },
}));

const SettingContent = styled.div(({ theme }) => ({
  color: theme.color.defaultText,
  margin: "8px 0 3px",

  p: {
    margin: 0,
  },
}));

const SettingValue = styled.div(({ theme }) => ({
  // fontFamily: theme.typography.fonts.mono,
  wordWrap: "break-word",
}));

const DisabledNote = styled.div(({ theme }) => ({
  color: theme.color.warningText,
  fontSize: theme.typography.size.s1,
}));

const ValueSuggestion = styled.div(({ theme }) => ({
  fontFamily: theme.typography.fonts.base,
  color: theme.base === "dark" ? theme.color.medium : theme.color.dark,
}));

const Description = styled.div(({ theme }) => ({
  color: theme.base === "dark" ? theme.color.medium : theme.color.dark,
  fontSize: theme.typography.size.s1,
  margin: "5px 15px 0",
}));

const Suggestion = styled.div<{ warning?: boolean }>(({ warning, theme }) => ({
  display: "flex",
  alignItems: "center",
  // eslint-disable-next-line no-nested-ternary
  backgroundColor: warning
    ? theme.base === "dark"
      ? "#342E1A"
      : theme.background.warning
    : theme.background.hoverable,
  borderRadius: 3,
  border: `1px solid ${theme.appBorderColor}`,
  gap: 5,
  margin: "5px 0",
  padding: 10,
  svg: {
    flexShrink: 0,
    // eslint-disable-next-line no-nested-ternary
    color: warning
      ? theme.base === "dark"
        ? theme.color.warning
        : theme.color.warningText
      : theme.color.secondary,
  },
  code: {
    fontSize: "90%",
  },
}));

const iconStyles = {
  width: 12,
  height: 12,
  margin: 2,
  verticalAlign: "top",
};

const AlertIcon = styled(Alert)(iconStyles);
const WandIcon = styled(Wand)(iconStyles);

interface ConfigurationProps {
  onClose: () => void;
}

export const Configuration = ({ onClose }: ConfigurationProps) => {
  const { uninstallAddon } = useUninstallAddon();
  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const { configuration = {}, problems = {}, suggestions = {} } = configInfo || {};
  const { configFile, ...options } = configuration;

  const config = Object.keys({ ...options, ...problems, ...suggestions })
    .sort()
    .map((key) => ({
      key,
      value: key in options ? options[key as keyof typeof options] : undefined,
      problem: problems[key as keyof typeof problems],
      suggestion: suggestions[key as keyof typeof suggestions],
    }));

  return (
    <Page>
      <StyledCloseButton onClick={onClose} style={{ marginRight: -8 }}>
        <CloseIcon aria-label="Close" />
      </StyledCloseButton>
      <PageWrapper>
        <Heading>Configuration </Heading>
        {configFile ? (
          <PageDescription>
            This is a read-only representation of the Chromatic configuration options found in{" "}
            <Code>{configFile}</Code>. Changes to the config file will be reflected here.{" "}
            <Link
              href="https://www.chromatic.com/docs/cli/#configuration-options"
              target="_blank"
              withArrow
            >
              Learn more
            </Link>
          </PageDescription>
        ) : (
          <PageDescription>
            To configure this addon, create <Code>chromatic.config.json</Code> in your project's
            root directory.{" "}
            <Link
              href="https://www.chromatic.com/docs/cli/#configuration-options"
              target="_blank"
              withArrow
            >
              Learn more
            </Link>
          </PageDescription>
        )}
        {config && (
          <Table>
            {config.map(({ key, value, problem, suggestion }) => (
              <div key={key} id={`${key}-option`}>
                <Setting>
                  <div>
                    <SettingHeading>
                      <SettingLabel>
                        {key}{" "}
                        <WithTooltip
                          hasChrome={false}
                          trigger="hover"
                          tooltip={
                            <TooltipNote
                              note={`Set to ${
                                configSchema[key as keyof typeof configSchema]?.type
                              } `}
                            />
                          }
                        >
                          <Markup size={12} />
                        </WithTooltip>
                      </SettingLabel>
                      {key in CONFIG_OVERRIDES && (
                        <DisabledNote>*Disabled for local builds</DisabledNote>
                      )}
                    </SettingHeading>
                    <SettingContent>
                      <SettingValue>
                        {value === undefined ? (
                          <ValueSuggestion>-</ValueSuggestion>
                        ) : (
                          JSON.stringify(value)
                        )}
                      </SettingValue>
                    </SettingContent>
                  </div>
                </Setting>
                {problem !== undefined && (
                  <Suggestion warning>
                    <AlertIcon />
                    {problem === null ? (
                      <span>
                        <strong>Warning: </strong>This should be removed.
                      </span>
                    ) : (
                      <span>
                        <strong>Warning: </strong>
                        This should be: <Code>{JSON.stringify(problem)}</Code>
                      </span>
                    )}
                  </Suggestion>
                )}
                {suggestion !== undefined && (
                  <Suggestion>
                    <WandIcon />
                    <span>
                      <strong>Hint: </strong>
                      Try setting as <Code>{JSON.stringify(suggestion)}</Code>
                    </span>
                  </Suggestion>
                )}
                <Description>
                  {configSchema[key as keyof typeof configSchema]?.description}
                </Description>
              </div>
            ))}
            <div>
              <Heading style={{ marginTop: 15 }}>Danger zone</Heading>
              <Setting>
                <div style={{ maxWidth: 270 }}>
                  <SettingHeading>
                    <SettingLabel>Uninstall addon</SettingLabel>
                  </SettingHeading>
                  <SettingContent>
                    <p>
                      Removing the addon updates your Storybook configuration and uninstalls the
                      dependency.
                    </p>
                  </SettingContent>
                </div>
                <Button onClick={uninstallAddon}>Remove</Button>
              </Setting>
            </div>
          </Table>
        )}
      </PageWrapper>
    </Page>
  );
};
