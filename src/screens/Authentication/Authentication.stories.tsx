// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fn, mocked } from 'storybook/test';

import { panelModes } from '../../modes';
import { GraphQLClientProvider } from '../../utils/graphQLClient';
import { storyWrapper } from '../../utils/storyWrapper';
import { type AuthValue, useAuth } from '../../utils/useAuth';
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
  argTypes: {
    auth: {
      control: 'object',
      target: 'auth',
    },
  },
  beforeEach: ({ argsByTarget }) => {
    const auth: AuthValue = {
      token: 'token',
      isOpen: false,
      subdomain: 'www',
      screen: 'welcome',
      exchangeParameters: null,
      ...argsByTarget['auth']?.auth,
    };
    mocked(useAuth).mockImplementation(() => [auth, fn().mockName('setAuth')]);
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
  args: {
    auth: { screen: 'signin' },
  },
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317993&t=3EAIRe8423CpOQWY-4'
  ),
} satisfies Story;

export const SSO = {
  args: {
    auth: { screen: 'subdomain' },
  },
  parameters: withFigmaDesign(
    'https://www.figma.com/file/p4ZIW7diUWC2l2DAf5xpYI/Storybook-Connect-plugin-(EXTERNAL-USE)?type=design&node-id=1-1734&t=ysgtc5qR40kqRKtI-4'
  ),
} satisfies Story;

export const Verify = {
  args: {
    auth: {
      screen: 'verify',
      exchangeParameters: {
        user_code: '123123',
        verificationUrl:
          'https://www.chromatic.com/connect/chromaui:addon-visual-tests?code=123123',
      },
    },
  },
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318063&t=3EAIRe8423CpOQWY-4'
  ),
} satisfies Story;
