import express from "express";
import { run } from "chromatic/node";

/**
 * to load the built addon in this test Storybook
 */
function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve("./manager.mjs")];
}

function serve(projectToken: string) {
  // Temporarily create a server as a psuedo server channel. This is throwaway code
  const app = express();

  app.post("/build", async (req, res) => {
    let sent = false;
    res.setHeader("access-control-allow-origin", "*");

    await run({
      flags: {
        projectToken,
      },
      options: {
        onTaskComplete(ctx: any) {
          console.log(`Completed task '${ctx.title}'`);
          if (ctx.announcedBuild && !sent) {
            const { id, number, app } = ctx.announcedBuild;
            res.json({
              id,
              url: `https://www.chromatic.com/build?appId=${app.id}&number=${number}`,
            });
            sent = true;
          }
        },
      } as any,
    });
  });

  app
    .listen(8765, () => {
      console.log("Listening on port 8765");
    })
    .on("error", (err) => {
      // The above will throw when you try and build your SB or start a second dev server.
      // As this is throwaway code we won't try and fix this.
      console.log(`caught err, ${err}`);
    });
}

let hasServed = false;
async function core(existing: any, { projectToken }: { projectToken: string }) {
  if (!hasServed) {
    serve(projectToken);
    hasServed = true;
  }
  return existing;
}

module.exports = {
  managerEntries,
  core,
};
