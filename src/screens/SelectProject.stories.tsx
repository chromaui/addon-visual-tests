import type { Meta, StoryObj } from "@storybook/react";
import { graphql } from "msw";

import { storyWrapper } from "../utils/graphQLClient";
import { SelectProject } from "./SelectProject";

const meta = {
  component: SelectProject,
  decorators: [storyWrapper],
  parameters: {
    msw: {
      handlers: [
        graphql.query("ProjectQuery", (req, res, ctx) =>
          res(
            ctx.data({
              project: {
                id: "123",
                name: "acme",
                webUrl: "https://www.chromatic.com/builds?appId=123",
                lastBuild: {
                  branch: "main",
                  number: 123,
                },
              },
            })
          )
        ),
      ],
    },
  },
} satisfies Meta<typeof SelectProject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
