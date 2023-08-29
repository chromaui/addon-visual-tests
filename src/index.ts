/* eslint-disable no-console */
import type { Channel } from "@storybook/channels";
// eslint-disable-next-line import/no-unresolved
import { getGitInfo, GitInfo, run } from "chromatic/node";
import { relative } from "path";

import {
  BUILD_ANNOUNCED,
  BUILD_STARTED,
  CHROMATIC_BASE_URL,
  GIT_INFO,
  GitInfoPayload,
  PROJECT_UPDATED,
  PROJECT_UPDATING_FAILED,
  ProjectUpdatingFailedPayload,
  START_BUILD,
  UPDATE_PROJECT,
  UpdateProjectPayload,
} from "./constants";
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
    projectToken: initialProjectToken,

    // This is a small subset of the flags available to the CLI.
    buildScriptName,
    debug,
    zip,
  }: {
    configDir: string;
    projectToken: string;
    buildScriptName?: string;
    debug?: boolean;
    zip?: boolean;
  }
) {
  let projectToken = initialProjectToken;
  channel.on(START_BUILD, async () => {
    let announced = false;
    let started = false;
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
          console.log(`Completed task '${ctx.title}'`);
          if (!announced && ctx.announcedBuild) {
            console.debug("emitting", BUILD_ANNOUNCED, ctx.announcedBuild.id);
            channel.emit(BUILD_ANNOUNCED, ctx.announcedBuild.id);
            announced = true;
          }
          if (announced && !started && ctx.build) {
            console.debug("emitting", BUILD_STARTED, ctx.build.status);
            channel.emit(BUILD_STARTED, ctx.build.status);
            started = true;
          }
        },
        // as any due to CLI mistyping: https://github.com/chromaui/chromatic-cli/pull/800
      },
    });
  });

  channel.on(
    UPDATE_PROJECT,
    async ({ projectId, projectToken: updatedProjectToken }: UpdateProjectPayload) => {
      projectToken = updatedProjectToken;

      try {
        await updateMain({ configDir, projectId, projectToken });
        channel.emit(PROJECT_UPDATED);
      } catch (err) {
        console.warn(`Failed to update your main configuration:\n\n ${err}`);
        const relativeConfigDir = relative(process.cwd(), configDir);
        channel.emit(PROJECT_UPDATING_FAILED, {
          configDir: relativeConfigDir,
        } satisfies ProjectUpdatingFailedPayload);
      }
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
