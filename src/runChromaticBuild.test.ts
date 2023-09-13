// eslint-disable-next-line import/no-unresolved
import * as chromatic from "chromatic/node";

import { runChromaticBuild } from "./runChromaticBuild";

jest.mock("chromatic/node", () => ({ run: jest.fn() }));

const run = jest.mocked(chromatic.run);

const store = {
  get value() {
    return this.state;
  },
  set value(newValue) {
    this.state = newValue;
  },
  on() {},
};

it("requires project token", async () => {
  await expect(runChromaticBuild(store, {})).rejects.toThrow("No project token set");
});

it("sets initial build payload", async () => {
  await runChromaticBuild(store, { projectToken: "token" });

  expect(store.value).toMatchObject({
    buildProgressPercentage: 0,
    currentStep: "initialize",
  });
});

// TODO Finish this
it.skip("sets build progress percentage", async () => {
  const ctx = { build: {} } as chromatic.Context;

  run.mockImplementation(({ options }) => {
    ctx.task = "auth";
    options.experimental_onTaskStart(ctx);

    options.experimental_onTaskComplete(ctx);
    ctx.task = "gitInfo";
    options.experimental_onTaskStart(ctx);

    options.experimental_onTaskComplete(ctx);
    ctx.task = "storybookInfo";
    options.experimental_onTaskStart(ctx);

    options.experimental_onTaskComplete(ctx);
    ctx.task = "initialize";
    options.experimental_onTaskStart(ctx);

    options.experimental_onTaskComplete(ctx);
    ctx.task = "build";
    options.experimental_onTaskStart(ctx);

    expect(store.value).toMatchObject({
      buildProgressPercentage: expect.closeTo(3, 0),
      currentStep: "build",
    });

    options.experimental_onTaskComplete(ctx);
    ctx.task = "upload";
    options.experimental_onTaskStart(ctx);

    options.experimental_onTaskComplete(ctx);
    ctx.task = "verify";
    options.experimental_onTaskStart(ctx);

    options.experimental_onTaskComplete(ctx);
    ctx.task = "snapshot";
    options.experimental_onTaskStart(ctx);

    options.experimental_onTaskComplete(ctx);
    return Promise.resolve({}) as ReturnType<typeof run>;
  });

  await runChromaticBuild(store, { projectToken: "token" });
});
