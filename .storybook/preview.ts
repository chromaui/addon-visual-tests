import type { Preview } from "@storybook/react";
import { initialize, mswDecorator } from "msw-storybook-addon";

// Initialize MSW
initialize({
  onUnhandledRequest(req) {
    if (req.url.origin !== document.location.origin) {
      console.error(
        `[MSW] %s %s %s (UNHANDLED)`,
        new Date().toTimeString().slice(0, 8),
        req.method.toUpperCase(),
        req.url.href
      );
    }
  },
});

// Provide the MSW addon decorator globally
export const decorators = [mswDecorator];

const preview: Preview = {
  parameters: {
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },
    backgrounds: {
      default: "light",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: "fullscreen",
  },
};

export default preview;
