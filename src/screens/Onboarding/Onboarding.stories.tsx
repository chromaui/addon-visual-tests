import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, userEvent } from "@storybook/testing-library";
import { graphql, HttpResponse } from "msw";

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
    queryError: undefined,
    hasData: true,
    hasSelectedBuild: false,
    startDevBuild: () => { },
    localBuildProgress: undefined,
    branch: "main",
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
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318908&t=3EAIRe8423CpOQWY-4"
  ),
};

export const ChangesDetected: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-319115&t=3EAIRe8423CpOQWY-4"
  ),
};

export const RunningFirstTest: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318481&t=3EAIRe8423CpOQWY-4"
  ),
};

export const ChangesFound: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=352-258984&t=3EAIRe8423CpOQWY-4"
  ),
};

export const Done: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318693&t=3EAIRe8423CpOQWY-4"
  ),
};
