import express from "express";
import { run } from "chromatic/node";

/**
 * to load the built addon in this test Storybook
 */
function managerEntries(entry = []) {
  return [...entry, require.resolve("../dist/manager.mjs")];
}

module.exports = {
  managerEntries,
};

function serve() {
  // Temporarily create a server as a psuedo server channel. This is throwaway code
  const app = express();

  app.post("/build", async (req, res) => {
    let sent = false;
    res.setHeader("access-control-allow-origin", "*");

    await run({
      flags: {
        projectToken: "00baf09dbbe8",
      },
      options: {
        onTaskComplete(ctx) {
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
      },
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

serve();
