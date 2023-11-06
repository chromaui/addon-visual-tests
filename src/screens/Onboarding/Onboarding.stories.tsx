import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, userEvent } from "@storybook/testing-library";
import { graphql, HttpResponse } from "msw";
import React from "react";

import { INITIAL_BUILD_PAYLOAD } from "../../buildSteps";
import { panelModes } from "../../modes";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { Onboarding } from "./Onboarding";

const meta = {
  component: Onboarding,
  decorators: [storyWrapper],
  args: {
    // queryError: undefined,
    // hasData: true,
    // hasSelectedBuild: false,
    startDevBuild: () => { },
    setShouldShowOnboarding: action("setShouldShowOnboarding"),
    localBuildProgress: undefined,
    gitInfo: {
      uncommittedHash: "123",
      branch: "main",
    },
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

export const Default: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318140&t=3EAIRe8423CpOQWY-4"
  ),
};

export const InProgress: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318374&t=3EAIRe8423CpOQWY-4"
  ),
};

export const BaselineSaved: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 100,
      currentStep: "complete",
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318539&t=3EAIRe8423CpOQWY-4"
  ),
};

export const MakeAChange: Story = {
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
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318908&t=3EAIRe8423CpOQWY-4"
  ),
};

export const ChangesDetected: Story = {
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
        <meta.component
          {...args}
          gitInfo={gitInfo}
          startDevBuild={() => setLocalBuildProgress(INITIAL_BUILD_PAYLOAD)}
          localBuildProgress={localBuildProgress}
        />
      </>
    );
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-319115&t=3EAIRe8423CpOQWY-4"
  ),
};

export const RunningFirstTest: Story = {
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
        <meta.component
          {...args}
          gitInfo={gitInfo}
          startDevBuild={() =>
            setLocalBuildProgress({
              ...INITIAL_BUILD_PAYLOAD,
              currentStep: "upload",
              buildProgressPercentage: 30,
            })
          }
          localBuildProgress={localBuildProgress}
        />
      </>
    );
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318481&t=3EAIRe8423CpOQWY-4"
  ),
};

export const ChangesFound: Story = {
  ...RunningFirstTest,
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
        <meta.component
          {...args}
          gitInfo={gitInfo}
          startDevBuild={() =>
            setLocalBuildProgress({
              ...INITIAL_BUILD_PAYLOAD,
              buildProgressPercentage: 100,
              currentStep: "complete",
            })
          }
          localBuildProgress={localBuildProgress}
        />
      </>
    );
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=352-258984&t=3EAIRe8423CpOQWY-4"
  ),
};

export const Done: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318693&t=3EAIRe8423CpOQWY-4"
  ),
};

// TODO: This design for an error in the Onboarding is incomplete
export const Error: Story = {
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
  },
  // TODO: Review the actual design with MA to determine what this should look like.
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318693&t=3EAIRe8423CpOQWY-4"
  ),
};
