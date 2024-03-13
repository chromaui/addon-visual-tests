import { beforeEach, describe, expect, it, vi } from "vitest";

import { INITIAL_BUILD_PAYLOAD } from "./buildSteps";
import { onCompleteOrError, onStartOrProgress, runChromaticBuild } from "./runChromaticBuild";
import { LocalBuildProgress } from "./types";

vi.mock("chromatic/node", () => ({ run: vi.fn() }));

const store = {
  state: undefined as LocalBuildProgress | undefined,
  get value() {
    if (!this.state) throw new Error("need to call set first");

    return this.state;
  },
  set value(newValue: LocalBuildProgress) {
    this.state = newValue;
  },
  on() {},
  off() {},
};

describe("runChromaticBuild", () => {
  it("requires projectId and userToken", async () => {
    await expect(runChromaticBuild(store, {} as any)).rejects.toThrow("Missing projectId");
    await expect(runChromaticBuild(store, { projectId: "project-id" } as any)).rejects.toThrow(
      "Missing userToken"
    );
  });

  it("sets initial build payload", async () => {
    await runChromaticBuild(store, {
      projectId: "project-id",
      userToken: "user-token",
    } as any);

    expect(store.value).toMatchObject({
      buildProgressPercentage: 0,
      currentStep: "initialize",
    });
  });
});

describe("onStartOrProgress", () => {
  beforeEach(() => {
    store.value = JSON.parse(JSON.stringify(INITIAL_BUILD_PAYLOAD));
  });

  it("sets build id and branch", () => {
    const announcedBuild = { id: "build-id" };
    const git = { branch: "feature-branch" };
    onStartOrProgress(store)({ task: "initialize", announcedBuild, git } as any);
    expect(store.value).toMatchObject({
      buildId: "build-id",
      branch: "feature-branch",
      buildProgressPercentage: expect.any(Number),
      currentStep: "initialize",
      stepProgress: { initialize: { startedAt: expect.any(Number) } },
    });
  });

  it("sets build and step progress percentage at each step", async () => {
    expect(store.value).toMatchObject({
      buildProgressPercentage: 0,
      currentStep: "initialize",
    });

    onStartOrProgress(store)({ task: "build" } as any);
    expect(store.value).toMatchObject({
      buildProgressPercentage: expect.closeTo(3, 0),
      currentStep: "build",
      stepProgress: { build: { startedAt: expect.any(Number) } },
    });

    onStartOrProgress(store)({ task: "upload" } as any);
    expect(store.value).toMatchObject({
      buildProgressPercentage: expect.closeTo(14, 0),
      currentStep: "upload",
      stepProgress: { upload: { startedAt: expect.any(Number) } },
    });

    onStartOrProgress(store)({ task: "verify" } as any);
    expect(store.value).toMatchObject({
      buildProgressPercentage: expect.closeTo(29, 0),
      currentStep: "verify",
      stepProgress: { verify: { startedAt: expect.any(Number) } },
    });

    onStartOrProgress(store)({ task: "snapshot" } as any);
    expect(store.value).toMatchObject({
      buildProgressPercentage: expect.closeTo(41, 0),
      currentStep: "snapshot",
      stepProgress: { snapshot: { startedAt: expect.any(Number) } },
    });
  });

  it("updates progress with each invocation", () => {
    onStartOrProgress(store)({ task: "verify" } as any);
    expect(store.value.buildProgressPercentage).toBeCloseTo(29, 0);

    onStartOrProgress(store)({ task: "verify" } as any);
    expect(store.value.buildProgressPercentage).toBeCloseTo(30, 0);

    onStartOrProgress(store)({ task: "verify" } as any);
    expect(store.value.buildProgressPercentage).toBeCloseTo(32, 0);
  });

  it("can never exceed progress for a step beyond the next step", () => {
    for (let n = 10; n; n -= 1) onStartOrProgress(store)({ task: "verify" } as any);
    expect(store.value.buildProgressPercentage).toBeCloseTo(41, 0);

    for (let n = 10; n; n -= 1) onStartOrProgress(store)({ task: "verify" } as any);
    expect(store.value.buildProgressPercentage).toBeCloseTo(41, 0);

    onStartOrProgress(store)({ task: "snapshot" } as any);
    expect(store.value.buildProgressPercentage).toBeCloseTo(41, 0);
  });

  it('updates build progress based on "progress" and "total" values', () => {
    onStartOrProgress(store)({ task: "snapshot" } as any);
    expect(store.value.buildProgressPercentage).toBeCloseTo(41, 0);

    onStartOrProgress(store)({ task: "snapshot" } as any, { progress: 1, total: 2 });
    expect(store.value.stepProgress.snapshot).toMatchObject({ numerator: 1, denominator: 2 });
    expect(store.value.buildProgressPercentage).toBeCloseTo(70, 0);

    onStartOrProgress(store)({ task: "snapshot" } as any, { progress: 2, total: 2 });
    expect(store.value.stepProgress.snapshot).toMatchObject({ numerator: 2, denominator: 2 });
    expect(store.value.buildProgressPercentage).toBeCloseTo(100, 0);
  });
});

describe("onCompleteOrError", () => {
  beforeEach(() => {
    store.value = JSON.parse(JSON.stringify(INITIAL_BUILD_PAYLOAD));
  });

  it("sets build progress to 100% on completion of final step", () => {
    const build = { changeCount: 1, errorCount: 2 };
    onCompleteOrError(store)({ task: "snapshot", build } as any);
    expect(store.value).toMatchObject({
      buildProgressPercentage: 100,
      currentStep: "complete",
      stepProgress: { snapshot: { completedAt: expect.any(Number) } },
      changeCount: 1,
      errorCount: 2,
    });
  });

  it("does not set build progress to 100% on error", () => {
    onStartOrProgress(store)({ task: "snapshot" } as any);
    expect(store.value.buildProgressPercentage).toBeCloseTo(41, 0);

    const error = { formattedError: "Oops!", originalError: new Error("Oops!") };
    onCompleteOrError(store)({ task: "snapshot" } as any, error);
    expect(store.value).toMatchObject({
      buildProgressPercentage: expect.closeTo(41, 0),
      currentStep: "error",
      stepProgress: { snapshot: { startedAt: expect.any(Number) } },
      ...error,
    });
  });
});
