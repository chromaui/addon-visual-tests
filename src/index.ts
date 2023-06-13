import type { Channel } from "@storybook/channels";
import { run } from "chromatic/node";
import { BUILD_STARTED, START_BUILD } from "./constants";

/**
 * to load the built addon in this test Storybook
 */
function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve("./manager.mjs")];
}

async function experimental_serverChannel(
  channel: Channel,
  { projectToken }: { projectToken: string }
) {
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
}

module.exports = {
  managerEntries,
  experimental_serverChannel,
};
