/* eslint-disable import/no-extraneous-dependencies */
import { action as act, type ActionOptions, type HandlerFunction } from "@storybook/addon-actions";
import { jest } from "@storybook/jest";

export const action = (name: string, options?: ActionOptions): HandlerFunction => {
  const spy = jest.fn(act(name, options));
  Object.defineProperty(spy, "name", { value: name, writable: false });
  return spy;
};
