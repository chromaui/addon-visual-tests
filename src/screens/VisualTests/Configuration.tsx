import { Link, TooltipNote, WithTooltip } from "@storybook/components";
import {
  AlertIcon as Alert,
  GlobeIcon,
  LockIcon as Lock,
  SupportIcon as Support,
  TrashIcon as Trash,
} from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";

import { CloseButton, CloseIcon, Heading } from "../../components/Accordions";
import { CONFIG_INFO, CONFIG_OVERRIDES } from "../../constants";
import { ConfigInfoPayload } from "../../types";
import { useSharedState } from "../../utils/useSharedState";
import { useUninstallAddon } from "../Uninstalled/UninstallContext";

const configSchema = {
  autoAcceptChanges: {
    description: "Automatically accept visual changes, usually for a specific branch name.",
    type: "string | boolean",
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
    description: "Write process context information to a JSON file.",
    type: "string | boolean",
  },
  exitOnceUploaded: {
    description: "Exit the process as soon as your Storybook is published.",
    type: "string | boolean",
  },
  exitZeroOnChanges: {
    description: "Exit the process succesfully even when visual changes are found.",
    type: "string | boolean",
  },
  externals: {
    description: "Disable TurboSnap when any of these files have changed since the baseline build.",
    type: "string[]",
  },
  fileHashing: {
    description: "Apply file hashing to skip uploading unchanged files (default: true).",
    type: "boolean",
  },
  ignoreLastBuildOnBranch: {
    description:
      "Do not use the last build on this branch as a baseline if it is no longer in history (i.e. branch was rebased).",
    type: "string",
  },
  junitReport: {
    description: "Write build results to a JUnit XML file.",
    type: "string | boolean",
  },
  logFile: {
    description: "Write Chromatic CLI logs to a file.",
    type: "string | boolean",
  },
  onlyChanged: {
    description:
      "Enables TurboSnap to only run stories affected by files changed since the baseline build.",
    type: "true | string (branch name)",
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
    type: "string | boolean",
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
    type: "string | boolean",
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

const Page = styled.div(({ theme }) => ({
  backgroundColor: theme.background.content,
  boxShadow: `0px 1px 1px ${theme.color.border}`,
  display: "flex",
  flexDirection: "column",
  padding: 15,

  code: {
    fontSize: "90%",
  },
}));

const Table = styled.dl(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 20,
  marginBottom: 10,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.appBorderRadius,
  padding: 15,

  "& > div": {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },

  dt: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "baseline",
    gap: 5,

    "& > div": {
      display: "flex",
      alignItems: "baseline",
      gap: 5,
    },
  },

  dd: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    gap: 5,

    "& > code": {
      display: "block",
      backgroundColor: theme.background.app,
      borderRadius: 3,
      margin: "4px 0",
      padding: 10,
    },
  },

  small: {
    color: theme.color.mediumdark,
    textWrap: "balance",
  },

  "@container (min-width: 800px)": {
    "& > div": {
      flexDirection: "row",
      gap: 15,
    },
    dt: {
      flexBasis: "35%",
    },
    dd: {
      flexBasis: "65%",
    },
  },
}));

const DangerZone = styled.div(({ theme }) => ({
  display: "flex",
  border: `1px solid ${theme.color.negativeText}`,
  borderRadius: theme.appBorderRadius,
  backgroundColor: `${theme.color.negativeText}11`,
  alignItems: "center",
  gap: 8,
  padding: 15,
  svg: { margin: 3 },
  p: { flexGrow: 1, margin: 0 },
  small: { display: "block", textWrap: "balance" },
  button: {
    backgroundColor: theme.background.content,
    border: `1px solid ${theme.color.negativeText}`,
    borderRadius: 3,
    color: theme.color.negativeText,
    fontWeight: "bold",
    padding: "4px 6px",
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: theme.color.negative,
      color: theme.color.negative,
    },
  },
}));

const Suggestion = styled.div<{ warning?: boolean }>(({ warning, theme }) => ({
  display: "flex",
  alignItems: "center",
  // eslint-disable-next-line no-nested-ternary
  backgroundColor: warning
    ? theme.base === "dark"
      ? "#342e1a"
      : theme.background.warning
    : theme.background.hoverable,
  borderRadius: 3,
  gap: 5,
  padding: 10,
  svg: {
    // eslint-disable-next-line no-nested-ternary
    color: warning
      ? theme.base === "dark"
        ? theme.color.warning
        : theme.color.warningText
      : theme.color.secondary,
  },
}));

const iconStyles = {
  width: 12,
  height: 12,
  margin: 2,
  verticalAlign: "top",
};

const AlertIcon = styled(Alert)(iconStyles);
const TrashIcon = styled(Trash)({ ...iconStyles, width: 20, height: 20 });
const SupportIcon = styled(Support)(iconStyles);
const LockIcon = styled(Lock)(iconStyles);

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
      <Heading>
        Configuration
        <CloseButton onClick={onClose}>
          <CloseIcon aria-label="Close" />
        </CloseButton>
      </Heading>
      {configFile ? (
        <div>
          Found Chromatic configuration options in <code>{configFile}</code>:
        </div>
      ) : (
        <div>
          Create a <code>chromatic.config.json</code> file to configure build options.
        </div>
      )}
      {config && (
        <Table>
          {config.map(({ key, value, problem, suggestion }) => (
            <div key={key} id={`${key}-option`}>
              <dt>
                <div>
                  <strong>
                    {key}{" "}
                    {key in CONFIG_OVERRIDES && (
                      <WithTooltip
                        hasChrome={false}
                        trigger="hover"
                        tooltip={
                          <TooltipNote
                            note={`Always ${JSON.stringify(
                              (CONFIG_OVERRIDES as any)[key]
                            )} for local builds.`}
                          />
                        }
                      >
                        <LockIcon />
                      </WithTooltip>
                    )}
                  </strong>
                  <small>{configSchema[key as keyof typeof configSchema]?.type}</small>
                </div>
                <small>
                  <i>{configSchema[key as keyof typeof configSchema]?.description}</i>
                </small>
              </dt>
              <dd>
                <code>{value === undefined ? "―" : JSON.stringify(value)}</code>
                {problem !== undefined && (
                  <Suggestion warning>
                    <AlertIcon />
                    {problem === null ? (
                      <span>This should be removed.</span>
                    ) : (
                      <span>
                        This should be: <code>{JSON.stringify(problem)}</code>
                      </span>
                    )}
                  </Suggestion>
                )}
                {suggestion !== undefined && (
                  <Suggestion>
                    <SupportIcon />
                    <span>
                      Might be better set to: <code>{JSON.stringify(suggestion)}</code>
                    </span>
                  </Suggestion>
                )}
              </dd>
            </div>
          ))}
        </Table>
      )}

      <Link
        href="https://www.chromatic.com/docs/cli/#configuration-options"
        target="_blank"
        withArrow
      >
        Chromatic configuration options
      </Link>
      <br />

      <Heading>Danger zone</Heading>
      <DangerZone>
        <TrashIcon />
        <p>
          <strong>Remove addon</strong>
          <br />
          <small>Updates your Storybook configuration and uninstalls the dependency.</small>
        </p>
        <button type="button" onClick={uninstallAddon}>
          Remove
        </button>
      </DangerZone>
    </Page>
  );
};
