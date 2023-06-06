import { linkTo } from "@storybook/addon-links";
import { Meta } from "@storybook/react";

import { storyWrapper } from "../storyWrapper";
import * as Onboarding from "./Onboarding";

const meta: Meta<typeof Onboarding> = {
  component: Onboarding.Onboarding,
  decorators: [storyWrapper],
};

export default meta;

export const Interactive = {};

export const Welcome = {
  render: Onboarding.Welcome,
  args: {
    onEnable: linkTo("screens/Onboarding", "Sign In"),
  },
};

export const SignIn = {
  render: Onboarding.SignIn,
  args: {
    onBack: linkTo("screens/Onboarding", "Welcome"),
    onSignIn: linkTo("screens/Onboarding", "Verify"),
    onSignInWithSSO: linkTo("screens/Onboarding", "Verify"),
  },
};

export const Verify = {
  render: Onboarding.Verify,
  args: {
    onBack: linkTo("screens/Onboarding", "Sign In"),
    onOpenChromatic: linkTo("screens/Onboarding", "Welcome"),
  },
};
