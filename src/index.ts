import type { Channel } from "@storybook/channels";
import { readConfig, writeConfig } from "@storybook/csf-tools";
// eslint-disable-next-line import/no-unresolved
import { run } from "chromatic/node";

import { BUILD_STARTED, START_BUILD, UPDATE_PROJECT } from "./constants";
import { findConfig } from "./utils/storybook.config.utils";

/**
 * to load the built addon in this test Storybook
 */
function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve("./manager.mjs")];
}

async function serverChannel(channel: Channel, { projectToken }: { projectToken: string }) {
  channel.on(START_BUILD, async () => {
    let sent = false;
    await run({
      flags: {
        projectToken,
      },
      options: {
        onTaskComplete(ctx: any) {
          // eslint-disable-next-line no-console
          console.log(`Completed task '${ctx.title}'`);
          if (ctx.announcedBuild && !sent) {
            const { id, number, app } = ctx.announcedBuild;
            // eslint-disable-next-line no-console
            console.log("emitting", BUILD_STARTED);
            channel.emit(BUILD_STARTED, {
              id,
              url: `https://www.chromatic.com/build?appId=${app.id}&number=${number}`,
            });
            sent = true;
          }
        },
      } as any,
    });
  });

  channel.on(UPDATE_PROJECT, async (id, token) => {

    // update project id
    // find config file path
    const previewPath = await findConfig("preview");
    // Find config file
    const PreviewConfig = await readConfig(previewPath);

    // Add parameters to config file
    const previousProjectId = PreviewConfig.getFieldNode(["parameters", "projectId"]);
    console.log("updating project id", previousProjectId, id);
    PreviewConfig.setFieldValue(["parameters", "projectId"], id);

    // Write to config file
    await writeConfig(PreviewConfig);



    // update project token in main.ts - this is not currently working, does not select the main.ts section correctly
    const mainPath = await findConfig("main");
    const MainConfig = await readConfig(mainPath);

    // TODO: Get the correct field node
    const addonsConfig = MainConfig.getFieldNode(["addons"]);
    console.log(addonsConfig);

    MainConfig.setFieldValue(["addons", "projectToken"], token);
  });

  return channel;
}

module.exports = {
  managerEntries,
  experimental_serverChannel: serverChannel,
};
