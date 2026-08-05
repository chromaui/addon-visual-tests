import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, findByRole, fn, userEvent } from 'storybook/test';

import { ProjectQueryQuery } from '../../gql/graphql';
import { panelModes } from '../../modes';
import { playAll } from '../../utils/playAll';
import { telemetrySpy } from '../../utils/telemetrySpy';
import { withFigmaDesign } from '../../utils/withFigmaDesign';
import { LinkedProject } from './LinkedProject';

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});

const meta = {
  component: LinkedProject,
  args: {
    projectId: 'Project:abc123',
    configFile: 'chromatic.config.json',
    goToNext: fn().mockName('goToNext'),
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
    ...withGraphQLQuery('ProjectQuery', () =>
      HttpResponse.json({
        data: {
          project: {
            id: '789',
            name: 'acme',
            webUrl: 'https://www.chromatic.com/builds?appId=789',
            lastBuild: {
              branch: 'main',
              number: 123,
            },
          },
        } satisfies ProjectQueryQuery,
      })
    ),
    ...withFigmaDesign(
      'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317094&t=435fylbu7gUQNEgq-4'
    ),
  },
} satisfies Meta<typeof LinkedProject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Telemetry story. Asserts on reported events rather than appearance, so it opts out of snapshots
 * and pins to a single theme (the default renders two canvases sharing one spy).
 */
const telemetry = telemetrySpy();

export const ReportsContinue: Story = {
  decorators: telemetry.decorators,
  parameters: {
    theme: 'light',
    chromatic: { disableSnapshot: true },
  },
  play: playAll(async ({ canvasElement }) => {
    await userEvent.click(await findByRole(canvasElement, 'button', { name: 'Continue' }));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'continue',
      location: 'LinkProject',
      screen: 'LinkedProject',
    });
  }),
};
