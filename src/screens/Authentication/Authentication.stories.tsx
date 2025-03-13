// @ts-nocheck TODO: Address SB 8 type errors
import { fn, findByRole, userEvent } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';

import { panelModes } from '../../modes';
import { GraphQLClientProvider } from '../../utils/graphQLClient';
import { playAll } from '../../utils/playAll';
import { storyWrapper } from '../../utils/storyWrapper';
import { clearSessionState } from '../../utils/useSessionState';
import { withFigmaDesign } from '../../utils/withFigmaDesign';
import { withSetup } from '../../utils/withSetup';
import { Authentication } from './Authentication';

const meta = {
  component: Authentication,
  decorators: [withSetup(clearSessionState), storyWrapper(GraphQLClientProvider)],
  args: {
    setAccessToken: fn().mockName('setAccessToken'),
    hasProjectId: false,
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
    msw: {
      handlers: [
        http.post('*/authorize', () =>
          HttpResponse.json({
            device_code: 'chdc_95a7123d17a84851abcdefc869ec0741',
            user_code: '123 123',
            verification_uri: 'https://www.chromatic.com/connect/chromaui:addon-visual-tests',
            verification_uri_complete:
              'https://www.chromatic.com/connect/chromaui:addon-visual-tests?code=123123',
            expires_in: 300,
            interval: 5,
          })
        ),
        http.post('*/token', () =>
          HttpResponse.json({
            error: 'authorization_pending',
            error_description: 'Authorization is pending approval',
          })
        ),
      ],
    },
  },
} satisfies Meta<typeof Authentication>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome = {
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317931&t=3EAIRe8423CpOQWY-4'
  ),
} satisfies Story;

export const HasProjectId = {
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317931&t=3EAIRe8423CpOQWY-4'
  ),
  args: {
    hasProjectId: true,
  },
} satisfies Story;

export const SignIn = {
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317993&t=3EAIRe8423CpOQWY-4'
  ),
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, 'button', {
      name: 'Enable',
    });
    await userEvent.click(button);
  }),
} satisfies Story;

export const SSO = {
  parameters: withFigmaDesign(
    'https://www.figma.com/file/p4ZIW7diUWC2l2DAf5xpYI/Storybook-Connect-plugin-(EXTERNAL-USE)?type=design&node-id=1-1734&t=ysgtc5qR40kqRKtI-4'
  ),
  play: playAll(SignIn, async (context) => {
    const button = await findByRole(context.canvasElement, 'button', {
      name: 'Sign in with SSO',
    });
    await userEvent.click(button);
  }),
} satisfies Story;

export const Verify = {
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318063&t=3EAIRe8423CpOQWY-4'
  ),
  play: playAll(SignIn, async (context) => {
    const button = await findByRole(context.canvasElement, 'button', {
      name: 'Sign in with Chromatic',
    });
    await userEvent.click(button);
  }),
} satisfies Story;
