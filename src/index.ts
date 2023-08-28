/* eslint-disable no-console */
import type { Channel } from "@storybook/channels";
import { readConfig, writeConfig } from "@storybook/csf-tools";
// eslint-disable-next-line import/no-unresolved
import { getGitInfo, GitInfo, run } from "chromatic/node";

import {
  BUILD_PROGRESS,
  BuildProgressPayload,
  CHROMATIC_ADDON_NAME,
  CHROMATIC_BASE_URL,
  GIT_INFO,
  GitInfoPayload,
  START_BUILD,
  UPDATE_PROJECT,
  UpdateProjectPayload,
} from "./constants";
import { findConfig } from "./utils/storybook.config.utils";

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
    projectToken: initialProjectToken,
    buildScriptName,
  }: { configDir: string; projectToken: string; buildScriptName?: string }
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
              id: ctx.announcedBuild.id,
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

  channel.on(
    UPDATE_PROJECT,
    async ({ projectId, projectToken: updatedProjectToken }: UpdateProjectPayload) => {
      projectToken = updatedProjectToken;

      const mainPath = await findConfig(configDir, "main");
      const MainConfig = await readConfig(mainPath);

      const addonsConfig = MainConfig.getFieldValue(["addons"]);
      const updatedAddonsConfig = addonsConfig.map(
        (addonConfig: string | { name: string; options?: Record<string, string> }) => {
          const fullConfig = typeof addonConfig === "string" ? { name: addonConfig } : addonConfig;
          if (fullConfig.name === CHROMATIC_ADDON_NAME) {
            return {
              ...fullConfig,
              options: { projectId, projectToken, ...fullConfig.options },
            };
          }
          return addonConfig;
        }
      );

      MainConfig.setFieldValue(["addons"], updatedAddonsConfig);
      await writeConfig(MainConfig);
    }
  );

  observeGitInfo(5000, (info) => channel.emit(GIT_INFO, info as GitInfoPayload));

  return channel;
}

const config = {
  managerEntries,
  experimental_serverChannel: serverChannel,
  env: async (
    env: Record<string, string>,
    { projectId, configType }: { projectId: string; configType: "development" | "production" }
  ) => {
    if (configType === "production") return env;

    const { userEmail, userEmailHash, branch, commit, slug, uncommittedHash } = await getGitInfo();
    return {
      ...env,
      CHROMATIC_BASE_URL,
      CHROMATIC_PROJECT_ID: projectId || "",
      GIT_USER_EMAIL: userEmail,
      GIT_USER_EMAIL_HASH: userEmailHash,
      GIT_BRANCH: branch,
      GIT_COMMIT: commit,
      GIT_SLUG: slug,
      GIT_UNCOMMITTED_HASH: uncommittedHash,
    };
  },
};

export default config;
