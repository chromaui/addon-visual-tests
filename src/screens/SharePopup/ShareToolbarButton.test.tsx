import { describe, expect, it, vi } from 'vitest';

import { SHARE_TELEMETRY } from '../../constants';
import { ShareToolbarButton } from './ShareToolbarButton';

vi.mock('storybook/internal/components', () => ({
  Button: 'button',
  PopoverProvider: 'div',
}));
vi.mock('./SharePopup', () => ({ SharePopup: 'div' }));

describe('ShareToolbarButton', () => {
  it('records opening Share when clicked', () => {
    const emit = vi.fn();
    const api = { getChannel: () => ({ emit }) } as any;

    const tree = ShareToolbarButton({ api });
    tree.props.children.props.onClick();

    expect(emit).toHaveBeenCalledWith(SHARE_TELEMETRY, {
      action: 'openShare',
      entryPoint: 'toolbar',
      location: 'SharePopup',
      screen: 'Toolbar',
    });
  });
});
