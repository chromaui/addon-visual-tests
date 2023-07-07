import type { Channel } from "@storybook/channels";
// eslint-disable-next-line import/no-unresolved
import { run } from "chromatic/node";

import { BUILD_STARTED, START_BUILD } from "./constants";

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
            // eslint-disable-next-line no-console
            console.log("emitting", BUILD_STARTED);
            channel.emit(BUILD_STARTED, ctx.announcedBuild.id);
            sent = true;
          }
        },
      } as any,
    });
  });

  return channel;
}

module.exports = {
  managerEntries,
  experimental_serverChannel: serverChannel,
};
