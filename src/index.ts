import type { Channel } from "@storybook/channels";
import { readConfig, writeConfig } from "@storybook/csf-tools";
// eslint-disable-next-line import/no-unresolved
import { run } from "chromatic/node";

import { BUILD_STARTED, START_BUILD } from "./constants";
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
          console.log(`Completed task '${ctx.title}'`);
          if (ctx.announcedBuild && !sent) {
            const { id, number, app } = ctx.announcedBuild;
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

  channel.on("ADD_PROJECT_ID", async (id) => {
    // find config file path
    const previewPath = await findConfig("preview");
    // Find config file
    const PreviewConfig = await readConfig(previewPath);

    // Add parameters to config file
    PreviewConfig.setFieldValue(["projectId"], id);

    // Write to config file
    await writeConfig(PreviewConfig);
  });

  return channel;
}

module.exports = {
  managerEntries,
  experimental_serverChannel: serverChannel,
};
