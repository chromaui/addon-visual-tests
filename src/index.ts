import type { Channel } from "@storybook/channels";
import { readConfig, writeConfig } from "@storybook/csf-tools";
// eslint-disable-next-line import/no-unresolved
import { getGitInfo, GitInfo, run } from "chromatic/node";

import {
  BUILD_STARTED,
  CHROMATIC_ADDON_NAME,
  CHROMATIC_BASE_URL,
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

async function serverChannel(
  channel: Channel,
  { projectToken: initialProjectToken }: { projectToken: string }
) {
  let projectToken = initialProjectToken;
  channel.on(START_BUILD, async () => {
    let sent = false;
    await run({
      // Currently we have to have this flag. We should move the check to after flags have been
      // parsed into options.
      flags: { projectToken },
      options: {
        // We might want to drop this later and instead record "uncommitted hashes" on builds
        forceRebuild: true,
        // Builds initiated from the addon are always considered local
        isLocalBuild: true,
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

    const { userEmail, branch, commit, slug } = await getGitInfo();
    return {
      ...env,
      CHROMATIC_BASE_URL,
      CHROMATIC_PROJECT_ID: projectId || "",
      GIT_USER_EMAIL: userEmail,
      GIT_BRANCH: branch,
      GIT_COMMIT: commit,
      GIT_SLUG: slug,
    };
  },
};

export default config;
