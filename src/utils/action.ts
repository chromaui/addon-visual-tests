import { action as act, type ActionOptions, type HandlerFunction } from '@storybook/addon-actions';
import { fn } from 'storybook/test';

export const action = (name: string, options?: ActionOptions): HandlerFunction => {
  const spy = fn(act(name, options));
  Object.defineProperty(spy, 'name', { value: name, writable: false });
  return spy;
};
