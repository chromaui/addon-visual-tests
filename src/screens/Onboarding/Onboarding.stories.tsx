import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { findByRole, userEvent } from "@storybook/testing-library";
import { graphql, HttpResponse } from "msw";
import React from "react";

import { INITIAL_BUILD_PAYLOAD } from "../../buildSteps";
import { panelModes } from "../../modes";
import { LocalBuildProgress } from "../../types";
import { GraphQLClientProvider } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { storyWrapper } from "../../utils/storyWrapper";
import { clearSessionState } from "../../utils/useSessionState";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { withSetup } from "../../utils/withSetup";
import { BuildProvider } from "../VisualTests/BuildContext";
import { acceptedBuild, acceptedTests, buildInfo, withTests } from "../VisualTests/mocks";
import { RunBuildProvider } from "../VisualTests/RunBuildContext";
import { Onboarding } from "./Onboarding";

const RunBuildWrapper = ({
  children,
  localBuildProgress,
  startBuild = () => {},
  stopBuild = () => {},
}: {
  children: React.ReactNode;
  localBuildProgress: LocalBuildProgress | undefined;
  startBuild?: () => void;
  stopBuild?: () => void;
}) => (
  <RunBuildProvider
    watchState={{
      isRunning:
        !!localBuildProgress &&
        !["aborted", "complete", "error"].includes(localBuildProgress.currentStep),
      startBuild,
      stopBuild,
    }}
  >
    {children}
  </RunBuildProvider>
);

const meta = {
  component: Onboarding,
  decorators: [
    withSetup(clearSessionState),
    storyWrapper(BuildProvider, (ctx) => ({ watchState: buildInfo(ctx.parameters.selectedBuild) })),
    storyWrapper(GraphQLClientProvider),
  ],
  args: {
    dismissBuildError: fn(),
    localBuildProgress: undefined,
    gitInfo: {
      uncommittedHash: "123",
      branch: "main",
    },
    onComplete: fn(),
    onSkip: fn(),
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
    msw: {
      handlers: [
        graphql.query("ProjectQuery", () =>
          HttpResponse.json({
            data: {
              project: {
                id: "123",
                name: "acme",
                webUrl: "https://www.chromatic.com/builds?appId=123",
                lastBuild: {
                  branch: "main",
                  number: 123,
                },
              },
            },
          })
        ),
      ],
    },
  },
} satisfies Meta<typeof Onboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318140&t=3EAIRe8423CpOQWY-4"
  ),
  args: {
    showInitialBuildScreen: true,
    lastBuildHasChangesForStory: false,
  },
} satisfies Story;

export const InProgress = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
    },
    showInitialBuildScreen: true,
    lastBuildHasChangesForStory: false,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318374&t=3EAIRe8423CpOQWY-4"
  ),
} satisfies Story;

export const BaselineSaved = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 100,
      currentStep: "complete",
    },
    showInitialBuildScreen: true,
    lastBuildHasChangesForStory: false,
  },
  parameters: {
    selectedBuild: withTests(acceptedBuild, acceptedTests),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318539&t=3EAIRe8423CpOQWY-4"
    ),
  },
} satisfies Story;

export const MakeAChange = {
  args: {
    ...BaselineSaved.args,
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", {
      name: "Catch a UI change",
    });
    await userEvent.click(button);
  }),
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [gitInfo, setGitInfo] = React.useState(args.gitInfo);
    return (
      <>
        <button
          type="button"
          style={{ position: "absolute", right: 0, bottom: 0 }}
          onClick={() => setGitInfo({ branch: "main", uncommittedHash: "changed-hash" })}
        >
          Change Git
        </button>
        <meta.component {...args} gitInfo={gitInfo} />
      </>
    );
  },
  parameters: {
    ...BaselineSaved.parameters,
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318908&t=3EAIRe8423CpOQWY-4"
    ),
  },
} satisfies Story;

export const ChangesDetected = {
  args: {
    ...BaselineSaved.args,
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", {
      name: "Catch a UI change",
    });
    await userEvent.click(button);

    const gitButton = await findByRole(canvasElement, "button", {
      name: "Change Git",
    });
    await userEvent.click(gitButton);
  }),
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [gitInfo, setGitInfo] = React.useState(args.gitInfo);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [localBuildProgress, setLocalBuildProgress] = React.useState(args.localBuildProgress);
    return (
      <>
        <button
          type="button"
          style={{ position: "absolute", right: 0, bottom: 0 }}
          onClick={() => setGitInfo({ branch: "main", uncommittedHash: "changed-hash" })}
        >
          Change Git
        </button>
        <RunBuildWrapper
          localBuildProgress={localBuildProgress}
          startBuild={() => setLocalBuildProgress(INITIAL_BUILD_PAYLOAD)}
        >
          <meta.component {...args} gitInfo={gitInfo} localBuildProgress={localBuildProgress} />
        </RunBuildWrapper>
      </>
    );
  },
  parameters: {
    ...BaselineSaved.parameters,
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-319115&t=3EAIRe8423CpOQWY-4"
    ),
  },
} satisfies Story;

export const RunningFirstTest = {
  ...ChangesDetected,
  args: {
    ...ChangesDetected.args,
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", {
      name: "Catch a UI change",
    });
    await userEvent.click(button);

    const gitButton = await findByRole(canvasElement, "button", {
      name: "Change Git",
    });
    await userEvent.click(gitButton);

    const runTestsButton = await findByRole(canvasElement, "button", {
      name: "Run visual tests",
    });
    await userEvent.click(runTestsButton);
  }),
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [gitInfo, setGitInfo] = React.useState(args.gitInfo);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [localBuildProgress, setLocalBuildProgress] = React.useState(args.localBuildProgress);
    return (
      <>
        <button
          type="button"
          style={{ position: "absolute", right: 0, bottom: 0 }}
          onClick={() => setGitInfo({ branch: "main", uncommittedHash: "changed-hash" })}
        >
          Change Git
        </button>
        <RunBuildWrapper
          localBuildProgress={localBuildProgress}
          startBuild={() =>
            setLocalBuildProgress({
              ...INITIAL_BUILD_PAYLOAD,
              currentStep: "upload",
              buildProgressPercentage: 30,
            })
          }
        >
          <meta.component {...args} gitInfo={gitInfo} localBuildProgress={localBuildProgress} />
        </RunBuildWrapper>
      </>
    );
  },
  parameters: {
    ...BaselineSaved.parameters,
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318481&t=3EAIRe8423CpOQWY-4"
    ),
  },
} satisfies Story;

export const RanFirstTestNoChanges = {
  ...RunningFirstTest,
  args: {
    ...RunningFirstTest.args,
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 100,
      currentStep: "complete",
    },
  },
  parameters: {
    chromatic: {
      // Delay to wait for git hash to reset.
      delay: 10001,
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [gitInfo, setGitInfo] = React.useState(args.gitInfo);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [localBuildProgress, setLocalBuildProgress] = React.useState(args.localBuildProgress);
    return (
      <>
        <button
          type="button"
          style={{ position: "absolute", right: 0, bottom: 0 }}
          onClick={() => setGitInfo({ branch: "main", uncommittedHash: "changed-hash" })}
        >
          Change Git
        </button>
        <RunBuildWrapper
          localBuildProgress={localBuildProgress}
          startBuild={() =>
            setLocalBuildProgress({
              ...INITIAL_BUILD_PAYLOAD,
              currentStep: "complete",
              buildProgressPercentage: 30,
            })
          }
        >
          <meta.component {...args} gitInfo={gitInfo} localBuildProgress={localBuildProgress} />
        </RunBuildWrapper>
      </>
    );
  },
} satisfies Story;

export const ChangesFound = {
  ...RunningFirstTest,
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [gitInfo, setGitInfo] = React.useState(args.gitInfo);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [localBuildProgress, setLocalBuildProgress] = React.useState(args.localBuildProgress);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [lastBuildHasChanges, setLastBuildHasChanges] = React.useState(false);
    return (
      <>
        <button
          type="button"
          style={{ position: "absolute", right: 0, bottom: 0 }}
          onClick={() => setGitInfo({ branch: "main", uncommittedHash: "changed-hash" })}
        >
          Change Git
        </button>
        <RunBuildWrapper
          localBuildProgress={localBuildProgress}
          startBuild={() => {
            setLocalBuildProgress({
              ...INITIAL_BUILD_PAYLOAD,
              buildProgressPercentage: 100,
              currentStep: "complete",
            });
            setLastBuildHasChanges(true);
          }}
        >
          <meta.component
            {...args}
            gitInfo={gitInfo}
            localBuildProgress={localBuildProgress}
            lastBuildHasChangesForStory={lastBuildHasChanges}
          />
        </RunBuildWrapper>
      </>
    );
  },
  parameters: {
    ...BaselineSaved.parameters,
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=352-258984&t=3EAIRe8423CpOQWY-4"
    ),
  },
} satisfies Story;

export const Error = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 100,
      currentStep: "error",
      originalError: {
        message:
          "\u001b[31m✖\u001b[39m \u001b[1mFailed to verify your Storybook\u001b[22m\nBuild verification timed out",
        name: "Error",
      },
    },
    lastBuildHasChangesForStory: false,
  },
  parameters: {
    ...BaselineSaved.parameters,
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318693&t=3EAIRe8423CpOQWY-4"
    ),
  },
} satisfies Story;

export const Limited = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 50,
      currentStep: "limited",
      errorDetailsUrl: "https://www.chromatic.com/billing?accountId=5af25af03c9f2c4bdccc0fcb",
    },
    lastBuildHasChangesForStory: false,
  },
  parameters: {
    ...BaselineSaved.parameters,
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318693&t=3EAIRe8423CpOQWY-4"
    ),
  },
} satisfies Story;
