/* eslint-disable no-console */
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
  GIT_STATE_CHANGED,
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

// TODO: use the chromatic CLI to get this info?
const execPromise = promisify(exec);
async function getGitInfo() {
  const branch = (await execPromise("git rev-parse --abbrev-ref HEAD")).stdout.trim();
  const commit = (await execPromise("git log -n 1 HEAD --format='%H'")).stdout.trim();
  const origin = (await execPromise("git config --get remote.origin.url")).stdout.trim();

  const [, slug] = origin.toLowerCase().match(/([^/:]+\/[^/]+?)(\.git)?$/) || [];
  const [ownerName, repoName, ...rest] = slug ? slug.split("/") : [];
  const isValidSlug = !!ownerName && !!repoName && !rest.length;

  return { branch, commit, slug: isValidSlug ? slug : "" };
}

// Retrieve the hash of the last commit + all uncommitted files, which includes staged, unstaged,
// and untracked files, excluding deleted files (which can't be hashed) and ignored files. There is
// no one single Git command to reliably get this information, so we use a combination of commands
// grouped together.
const getGitStateHash = async () => {
  const listStagedFiles = "git diff --name-only --diff-filter=d --cached";
  const listUnstagedFiles = "git diff --name-only --diff-filter=d";
  const listUntrackedFiles = "git ls-files --others --exclude-standard";
  const listUncommittedFiles = [listStagedFiles, listUnstagedFiles, listUntrackedFiles].join(";");

  // Pass the combined list of filenames to hash-object to retrieve a list of hashes.
  // Then pass the list of hashes plus the head commit hash to hash-object again to retrieve
  // a single hash of all hashes. We use stdin to avoid the limit on command line arguments.
  const getHashes = `((${listUncommittedFiles}) | git hash-object --stdin-paths; git rev-parse HEAD)`;
  return (await execPromise(`${getHashes} | git hash-object --stdin`)).stdout.trim();
};

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
          console.log(`Completed task '${ctx.title}'`);
          if (ctx.announcedBuild && !sent) {
            console.debug("emitting", BUILD_STARTED, ctx.announcedBuild.id);
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

  let lastGitStateHash: string | undefined;
  setInterval(() => {
    getGitStateHash()
      .then((hash) => {
        if (hash === lastGitStateHash) return;
        lastGitStateHash = hash;
        console.debug("emitting", GIT_STATE_CHANGED, hash);
        channel.emit(GIT_STATE_CHANGED, lastGitStateHash);
      })
      .catch((e) => {
        console.warn("Failed to retrieve git state hash");
        console.debug(e);
      });
  }, 5000);

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
