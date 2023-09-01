/* eslint-disable no-console */
import type { Channel } from "@storybook/channels";
// eslint-disable-next-line import/no-unresolved
import { getGitInfo, GitInfo, run } from "chromatic/node";
import { basename, relative } from "path";

import {
  BUILD_PROGRESS,
  BuildProgressPayload,
  CHROMATIC_BASE_URL,
  GIT_INFO,
  GitInfoPayload,
  PROJECT_INFO,
  ProjectInfoPayload,
  START_BUILD,
} from "./constants";
import { useAddonState } from "./useAddonState/server";
import { findConfig } from "./utils/storybook.config.utils";
import { updateMain } from "./utils/updateMain";

/**
 * to load the built addon in this test Storybook
 */
function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve("./manager.mjs")];
}

// Polls for changes to the Git state and invokes the callback when it changes.
// Uses a recursive setTimeout instead of setInterval to avoid overlapping async calls.
const observeGitInfo = async (
  interval: number,
  callback: (info: GitInfo, prevInfo: GitInfo) => void
) => {
  let prev: GitInfo;
  let timer: NodeJS.Timeout | null = null;
  const act = async () => {
    const gitInfo = await getGitInfo();
    if (Object.entries(gitInfo).some(([key, value]) => prev?.[key as keyof GitInfo] !== value)) {
      callback(gitInfo, prev);
    }
    prev = gitInfo;
    timer = setTimeout(act, interval);
  };
  act();

  return () => clearTimeout(timer);
};

async function serverChannel(
  channel: Channel,
  {
    configDir,
    projectId: initialProjectId,
    projectToken: initialProjectToken,

    // This is a small subset of the flags available to the CLI.
    buildScriptName,
    debug,
    zip,
  }: {
    configDir: string;
    projectId: string;
    projectToken: string;
    buildScriptName?: string;
    debug?: boolean;
    zip?: boolean;
  }
) {
  let projectToken = initialProjectToken;
  channel.on(START_BUILD, async () => {
    let step: BuildProgressPayload["step"] = "initialize";
    await run({
      // Currently we have to have these flags.
      // We should move the checks to after flags have been parsed into options.
      flags: {
        projectToken,
        buildScriptName,
        debug,
        zip,
      },
      options: {
        // We might want to drop this later and instead record "uncommitted hashes" on builds
        forceRebuild: true,
        // Builds initiated from the addon are always considered local
        isLocalBuild: true,
        onTaskComplete(ctx) {
          let newStep: BuildProgressPayload["step"];
          if (step === "initialize" && ctx.announcedBuild) {
            newStep = "build";
          }
          if (step === "upload" && ctx.isolatorUrl) {
            newStep = "verify";
          }
          if (["build", "upload"].includes(step) && ctx.build) {
            newStep = "snapshot";
          }
          if (ctx.build?.status !== "IN_PROGRESS") {
            newStep = "complete";
          }

          if (newStep !== step) {
            step = newStep;
            channel.emit(BUILD_PROGRESS, {
              step,
              id: ctx.announcedBuild?.id,
            } satisfies BuildProgressPayload);
          }
        },
        onTaskProgress(ctx, { progress, total, unit }) {
          if (unit === "bytes") {
            step = "upload";
          } else {
            step = "snapshot";
          }

          channel.emit(BUILD_PROGRESS, {
            step,
            id: ctx.announcedBuild.id,
            progress,
            total,
          } satisfies BuildProgressPayload);
        },
      },
    });
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const projectInfoState = useAddonState<ProjectInfoPayload>(channel, PROJECT_INFO);
  projectInfoState.value = initialProjectId
    ? { projectId: initialProjectId, projectToken: initialProjectToken }
    : {};

  projectInfoState.on("change", async ({ projectId, projectToken: updatedProjectToken }) => {
    if (projectToken === updatedProjectToken) return;
    projectToken = updatedProjectToken;

    const relativeConfigDir = relative(process.cwd(), configDir);
    let mainPath: string;
    try {
      mainPath = await findConfig(configDir, "main");
      await updateMain({ mainPath, projectId, projectToken });

      projectInfoState.value = {
        ...projectInfoState.value,
        written: true,
        mainPath: basename(mainPath),
        configDir: relativeConfigDir,
      };
    } catch (err) {
      console.warn(`Failed to update your main configuration:\n\n ${err}`);

      projectInfoState.value = {
        ...projectInfoState.value,
        written: false,
        mainPath: mainPath && basename(mainPath),
        configDir: relativeConfigDir,
      };
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gitInfoState = useAddonState<GitInfoPayload>(channel, GIT_INFO);
  observeGitInfo(5000, (info) => {
    gitInfoState.value = info;
  });

  return channel;
}

const config = {
  managerEntries,
  experimental_serverChannel: serverChannel,
  env: async (
    env: Record<string, string>,
    { configType }: { configType: "DEVELOPMENT" | "PRODUCTION" }
  ) => {
    if (configType === "PRODUCTION") return env;

    return {
      ...env,
      CHROMATIC_BASE_URL,
    };
  },
};

export default config;
