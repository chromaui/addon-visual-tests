import { describe, expect, it, vi } from 'vitest';

import { SHARE_TELEMETRY } from '../../constants';
import { ShareToolbarButton } from './ShareToolbarButton';

vi.mock('storybook/internal/components', () => ({
  Button: 'button',
  PopoverProvider: 'div',
}));
vi.mock('./SharePopup', () => ({ SharePopup: 'div' }));

const getToken = vi.fn(() => null as string | null);
vi.mock('../../auth/authStore', () => ({
  authStore: { getToken: () => getToken() },
}));

describe('ShareToolbarButton', () => {
  it('records opening Share when the popup becomes visible', () => {
    getToken.mockReturnValue(null);
    const emit = vi.fn();
    const api = { getChannel: () => ({ emit }) } as any;

    const tree = ShareToolbarButton({ api });
    tree.props.onVisibleChange(true);

    expect(emit).toHaveBeenCalledWith(SHARE_TELEMETRY, {
      action: 'openShare',
      entryPoint: 'toolbar',
      location: 'SharePopup',
      signedIn: false,
    });
  });

  it('includes signedIn true when a token is present', () => {
    getToken.mockReturnValue('token');
    const emit = vi.fn();
    const api = { getChannel: () => ({ emit }) } as any;

    const tree = ShareToolbarButton({ api });
    tree.props.onVisibleChange(true);

    expect(emit).toHaveBeenCalledWith(SHARE_TELEMETRY, {
      action: 'openShare',
      entryPoint: 'toolbar',
      location: 'SharePopup',
      signedIn: true,
    });
  });

  it('does not record openShare when the popup closes', () => {
    const emit = vi.fn();
    const api = { getChannel: () => ({ emit }) } as any;

    const tree = ShareToolbarButton({ api });
    tree.props.onVisibleChange(false);

    expect(emit).not.toHaveBeenCalled();
  });
});
