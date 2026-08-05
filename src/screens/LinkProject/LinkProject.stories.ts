// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
import { expect, findByTestId, findByText, fn, userEvent } from 'storybook/test';

import { SelectProjectsQueryQuery } from '../../gql/graphql';
import { panelModes } from '../../modes';
import { playAll } from '../../utils/playAll';
import { telemetrySpy } from '../../utils/telemetrySpy';
import { clearSessionState } from '../../utils/useSessionState';
import { withFigmaDesign } from '../../utils/withFigmaDesign';
import { withSetup } from '../../utils/withSetup';
import { LinkProject } from './LinkProject';

const meta = {
  component: LinkProject,
  args: {
    createdProjectId: undefined,
    onUpdateProject: fn().mockName('updateProject'),
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
  },
} satisfies Meta<typeof LinkProject>;

const fewProjects = {
  viewer: {
    accounts: [
      {
        id: 'account:123',
        name: 'yummly',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=123&view=createProject',
        projects: [
          {
            id: '123',
            name: 'optics',
            webUrl: 'https://www.chromatic.com/builds?appId=123',
          },
          {
            id: '456',
            name: 'design-system',
            webUrl: 'https://www.chromatic.com/builds?appId=456',
          },
        ],
      },
      {
        id: 'account:456',
        name: 'acme corp',
        projects: [
          {
            id: '789',
            name: 'acme',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
          },
        ],
      },
    ],
  },
} satisfies SelectProjectsQueryQuery;

const manyProjects = {
  viewer: {
    accounts: [
      {
        id: 'account:123',
        name: 'yummly',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=123&view=createProject',
        projects: [
          {
            id: '123',
            name: 'optics',
            webUrl: 'https://www.chromatic.com/builds?appId=123',
          },
          {
            id: '456',
            name: 'design-system',
            webUrl: 'https://www.chromatic.com/builds?appId=456',
          },
          {
            id: '789',
            name: 'test-repo',
            webUrl: 'https://www.chromatic.com/builds?appId=123',
          },
          {
            id: '101',
            name: 'shapes',
            webUrl: 'https://www.chromatic.com/builds?appId=456',
          },
          {
            id: '102',
            name: 'chroma-pets',
            webUrl: 'https://www.chromatic.com/builds?appId=123',
          },
          {
            id: '103',
            name: 'addon',
            webUrl: 'https://www.chromatic.com/builds?appId=456',
          },

          {
            id: '104',
            name: 'another-app',
            webUrl: 'https://www.chromatic.com/builds?appId=123',
          },
          {
            id: '105',
            name: 'below-the-fold',
            webUrl: 'https://www.chromatic.com/builds?appId=456',
          },
        ],
      },
      {
        id: 'account:456',
        name: 'acme corp',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=456&view=createProject',
        projects: [
          {
            id: '789',
            name: 'acme',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
          },
        ],
      },
      {
        id: 'account:4563',
        name: 'third corp',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=4563&view=createProject',
        projects: [
          {
            id: '7893',
            name: 'third',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
          },
        ],
      },
      {
        id: 'account:4564',
        name: 'fourth corp',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=4564&view=createProject',
        projects: [
          {
            id: '7894',
            name: 'fourth',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
          },
        ],
      },
      {
        id: 'account:4565',
        name: 'fifth corp',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=4565&view=createProject',
        projects: [
          {
            id: '7895',
            name: 'fifth',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
          },
        ],
      },
      {
        id: 'account:4566',
        name: 'acme corp',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=4566&view=createProject',
        projects: [
          {
            id: '7896',
            name: 'acme',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
          },
        ],
      },
      {
        id: 'account:4567',
        name: 'seventh corp',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=4567&view=createProject',
        projects: [
          {
            id: '7897',
            name: 'seven',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
          },
        ],
      },
      {
        id: 'account:4568',
        name: 'below the fold corp',
        newProjectUrl: 'https://www.chromatic.com/apps?accountId=4567&view=createProject',
        projects: [
          {
            id: '7897',
            name: 'below',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
          },
        ],
      },
    ],
  },
} satisfies SelectProjectsQueryQuery;

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});

const withSelectProjectsQuery = (projectResult: SelectProjectsQueryQuery) =>
  withGraphQLQuery('SelectProjectsQuery', () => HttpResponse.json({ data: projectResult }));

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectProject: Story = {
  parameters: {
    ...withSelectProjectsQuery(fewProjects),
    ...withFigmaDesign(
      'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318196&t=3EAIRe8423CpOQWY-4'
    ),
  },
};

export const SelectProjectManyProjects: Story = {
  parameters: {
    ...withSelectProjectsQuery(manyProjects),
    ...withFigmaDesign(
      'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317038&mode=design&t=P9IPi8sOGNpjCeNs-4'
    ),
  },
  play: playAll(async ({ canvasElement }) => {
    const rightDiv = await findByTestId(canvasElement, 'right-list');
    const leftDiv = await findByTestId(canvasElement, 'left-list');

    // scroll to the bottom of each div
    await rightDiv.scroll({ top: rightDiv.scrollHeight });
    await leftDiv.scroll({ top: leftDiv.scrollHeight });
  }),
};

export const EmptyNoProjects: Story = {
  parameters: {
    ...withSelectProjectsQuery({
      viewer: {
        accounts: [
          {
            id: 'account:123',
            name: 'acme corp',
            projects: [],
          },
        ],
      },
    }),
    ...withFigmaDesign(
      'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317038&mode=design&t=P9IPi8sOGNpjCeNs-4'
    ),
  },
};

export const Loading: Story = {
  parameters: {
    ...withGraphQLQuery('SelectProjectsQuery', () => delay('infinite')),
    ...withFigmaDesign(
      'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317038&mode=design&t=P9IPi8sOGNpjCeNs-4'
    ),
  },
};

/**
 * Telemetry stories. These assert on reported events rather than appearance, so they opt out of
 * snapshots and pin to a single theme (the default renders two canvases sharing one spy).
 */
const telemetry = telemetrySpy();
// The selected account is kept in session state, so clear it to keep stories independent.
const telemetryDecorators = [...telemetry.decorators, withSetup(clearSessionState)];
const telemetryParameters = {
  ...withSelectProjectsQuery(fewProjects),
  theme: 'light',
  chromatic: { disableSnapshot: true },
};

export const ReportsSelectAccount: Story = {
  decorators: telemetryDecorators,
  parameters: telemetryParameters,
  play: playAll(async ({ canvasElement }) => {
    await userEvent.click(await findByText(canvasElement, 'acme corp'));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'selectAccount',
      location: 'LinkProject',
      screen: 'LinkProject',
    });
  }),
};

export const ReportsSelectProject: Story = {
  decorators: telemetryDecorators,
  parameters: telemetryParameters,
  play: playAll(async ({ canvasElement }) => {
    await userEvent.click(await findByText(canvasElement, 'optics'));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'selectProject',
      location: 'LinkProject',
      screen: 'LinkProject',
    });
  }),
};

export const ReportsCreateProject: Story = {
  decorators: telemetryDecorators,
  parameters: telemetryParameters,
  play: playAll(async ({ canvasElement }) => {
    await userEvent.click(await findByText(canvasElement, 'Create new project'));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'createProject',
      location: 'LinkProject',
      screen: 'LinkProject',
    });
  }),
};
