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
  { projectToken: initialProjectToken, configDir }: { projectToken: string; configDir: string }
) {
  let projectToken = initialProjectToken;
  channel.on(START_BUILD, async () => {
    let announced = false;
    let started = false;
    await run({
      flags: {
        projectToken,
        // We might want to drop this later and instead record "uncommitted hashes" on builds
        forceRebuild: "",
      },
      options: {
        onTaskComplete(ctx: any) {
          console.log(`Completed task '${ctx.title}'`);
          if (ctx.announcedBuild && !announced) {
            console.debug("emitting", BUILD_ANNOUNCED, ctx.announcedBuild.id);
            channel.emit(BUILD_ANNOUNCED, ctx.announcedBuild.id);
            announced = true;
          }
          if (ctx.build && !started) {
            console.debug("emitting", BUILD_STARTED, ctx.build.status);
            channel.emit(BUILD_STARTED, ctx.build.status);
            started = true;
          }
        },
      } as any,
    });
  });

  channel.on(
    UPDATE_PROJECT,
    async ({ projectId, projectToken: updatedProjectToken }: UpdateProjectPayload) => {
      projectToken = updatedProjectToken;

      try {
        await updateMain({ projectId, projectToken });
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

  observeGitInfo(5000, (info) => channel.emit(GIT_INFO, info));

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

    const { branch, commit, slug, uncommittedHash } = await getGitInfo();
    return {
      ...env,
      CHROMATIC_BASE_URL,
      CHROMATIC_PROJECT_ID: projectId || "",
      GIT_BRANCH: branch,
      GIT_COMMIT: commit,
      GIT_SLUG: slug,
      GIT_UNCOMMITTED_HASH: uncommittedHash,
    };
  },
};

export default config;
