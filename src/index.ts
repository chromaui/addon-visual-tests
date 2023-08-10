import type { Channel } from "@storybook/channels";
import { readConfig, writeConfig } from "@storybook/csf-tools";
import { exec } from "child_process";
// eslint-disable-next-line import/no-unresolved
import { run } from "chromatic/node";
import { promisify } from "util";

import {
  BUILD_STARTED,
  CHROMATIC_ADDON_NAME,
  CHROMATIC_BASE_URL,
  GIT_INFO,
  START_BUILD,
  UPDATE_PROJECT,
  UpdateProjectPayload,
} from "./constants";
import { GitInfo } from "./types";
import { findConfig } from "./utils/storybook.config.utils";

/**
 * to load the built addon in this test Storybook
 */
function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve("./manager.mjs")];
}

async function serverChannel(
  channel: Channel,
  { projectToken: initialProjectToken }: { projectToken: string }
) {
  let projectToken = initialProjectToken;
  channel.on(START_BUILD, async () => {
    let sent = false;
    await run({
      flags: {
        projectToken,
        // We might want to drop this later and instead record "uncommitted hashes" on builds
        forceRebuild: "",
      },
      options: {
        onTaskComplete(ctx: any) {
          // eslint-disable-next-line no-console
          console.log(`Completed task '${ctx.title}'`);
          if (ctx.announcedBuild && !sent) {
            // eslint-disable-next-line no-console
            console.log("emitting", BUILD_STARTED);
            channel.emit(BUILD_STARTED, ctx.announcedBuild.id);
            sent = true;
          }
        },
      } as any,
    });
  });

  channel.on(
    UPDATE_PROJECT,
    async ({ projectId, projectToken: updatedProjectToken }: UpdateProjectPayload) => {
      projectToken = updatedProjectToken;

      const mainPath = await findConfig("main");
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

  observeGitInfo((info) => {
    channel.emit(GIT_INFO, info);
  });

  return channel;
}

const observeGitInfo = async (callback: (info: GitInfo) => void) => {
  // use a looping setTimeout over setInterval to avoid overlapping calls because of the async nature of the function
  let timer: NodeJS.Timeout | null = null;
  const existing = await getGitInfo();
  const act = async () => {
    const latest = await getGitInfo();
    if (
      latest.branch !== existing.branch ||
      latest.commit !== existing.commit ||
      latest.slug !== existing.slug
    ) {
      callback(latest);
    }

    timer = setTimeout(act, 1000);
  };

  timer = setTimeout(act, 1000);

  return () => clearTimeout(timer);
};

// TODO: use the chromatic CLI to get this info?
const execPromise = promisify(exec);
async function getGitInfo(): Promise<GitInfo> {
  const branch = (await execPromise("git rev-parse --abbrev-ref HEAD")).stdout.trim();
  const commit = (await execPromise("git log -n 1 HEAD --format='%H'")).stdout.trim();
  const origin = (await execPromise("git config --get remote.origin.url")).stdout.trim();

  const [, slug] = origin.toLowerCase().match(/([^/:]+\/[^/]+?)(\.git)?$/) || [];
  const [ownerName, repoName, ...rest] = slug ? slug.split("/") : [];
  const isValidSlug = !!ownerName && !!repoName && !rest.length;

  return { branch, commit, slug: isValidSlug ? slug : "" };
}

const config = {
  managerEntries,
  experimental_serverChannel: serverChannel,
  env: async (
    env: Record<string, string>,
    { projectId, configType }: { projectId: string; configType: "development" | "production" }
  ) => {
    if (configType === "production") return env;

    const { branch, commit, slug } = await getGitInfo();
    return {
      ...env,
      CHROMATIC_BASE_URL,
      CHROMATIC_PROJECT_ID: projectId || "",
      GIT_BRANCH: branch,
      GIT_COMMIT: commit,
      GIT_SLUG: slug,
    };
  },
};

export default config;
