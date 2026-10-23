import { ChromaticIcon } from '@storybook/icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Button, PopoverProvider } from 'storybook/internal/components';
import { useGlobals, useParameter, useStorybookState } from 'storybook/manager-api';
import { styled } from 'storybook/theming';

import { EMULATOR_PARAM, EMULATOR_RESTORE_KEY, SELECTED_MODE_NAME } from '../constants';
import { getGlobalsUpdate } from '../emulator/globals';
import {
  type CaptureMode,
  getViewportGlobal,
  resolveCaptureModes,
  type ViewportParameters,
} from '../emulator/modes';
import { type EmulatorSettings, getEmulatorSettings, isEmulatorActive } from '../emulator/settings';
import type { ChromaticParameters } from '../types';
import { useSharedState } from '../utils/useSharedState';
import { EmulatorMenu, type EmulatorMenuProps } from './EmulatorMenu';

type Globals = Record<string, unknown>;

// Styled manually, because Button's `active` prop is deprecated and ToggleButton would imply that
// clicking toggles the Chromatic emulator, while it opens the settings popover.
const ToolButton = styled(Button, { shouldForwardProp: (prop) => prop !== 'enabled' })<{
  enabled: boolean;
}>(({ theme, enabled }) =>
  enabled ? { color: theme.color.secondary, background: theme.background.hoverable } : {}
);

export const EmulatorButton = (props: EmulatorMenuProps) => {
  const { settings } = props;
  const active = isEmulatorActive(settings);
  return (
    <PopoverProvider
      hasChrome
      ariaLabel="Chromatic emulator settings"
      placement="bottom"
      padding={0}
      popover={<EmulatorMenu {...props} />}
    >
      <ToolButton
        ariaLabel="Chromatic emulator"
        tooltip={
          active
            ? 'Chromatic emulator is on: the preview matches how Chromatic captures this story. Click to configure.'
            : 'Chromatic emulator: preview this story the way Chromatic captures it, with frozen animations, hidden carets and the snapshot viewport and crop. Click to configure.'
        }
        variant="ghost"
        padding="small"
        enabled={active}
      >
        <ChromaticIcon />
      </ToolButton>
    </PopoverProvider>
  );
};

// Saved globals are stored as JSON, which can't represent undefined values (e.g. the initial
// `viewport.value`), so we encode those with a marker
const UNDEFINED = '__undefined__';

const isPlainObject = (value: unknown): value is Globals =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const mapValues = (value: unknown, fn: (value: unknown) => unknown): unknown =>
  isPlainObject(value)
    ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapValues(v, fn)]))
    : fn(value);

const readSavedGlobals = (): Globals => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(EMULATOR_RESTORE_KEY) || '{}');
    return mapValues(saved, (value) => (value === UNDEFINED ? undefined : value)) as Globals;
  } catch {
    return {};
  }
};

const writeSavedGlobals = (saved: Globals) => {
  if (Object.keys(saved).length) {
    const encoded = mapValues(saved, (value) => (value === undefined ? UNDEFINED : value));
    sessionStorage.setItem(EMULATOR_RESTORE_KEY, JSON.stringify(encoded));
  } else {
    sessionStorage.removeItem(EMULATOR_RESTORE_KEY);
  }
};

/**
 * Apply the mode globals and viewport size while the Chromatic emulator is active, and restore the
 * original globals afterwards.
 */
const useModeGlobals = (active: boolean, mode: CaptureMode) => {
  const [globals, updateGlobals, storyGlobals] = useGlobals();
  const { storyId } = useStorybookState();
  const latest = useRef({ globals, storyGlobals });
  latest.current = { globals, storyGlobals };

  const target = useMemo(
    () => (active ? { ...mode.globals, viewport: getViewportGlobal(mode) } : {}),
    [active, mode]
  );

  // Deliberately not rerun when globals change, so the user can still change globals manually
  useEffect(() => {
    const { update, saved } = getGlobalsUpdate({
      current: latest.current.globals,
      target,
      saved: readSavedGlobals(),
      locked: latest.current.storyGlobals,
    });
    writeSavedGlobals(saved);
    if (Object.keys(update).length) updateGlobals(update);
  }, [target, storyId, updateGlobals]);
};

export const EmulatorTool = () => {
  const [globals, updateGlobals, storyGlobals] = useGlobals();
  const chromatic = useParameter<ChromaticParameters['chromatic']>('chromatic', {});
  const viewport = useParameter<ViewportParameters>('viewport', {});
  // The mode is selected in the Visual Tests panel
  const [selectedModeName] = useSharedState<string>(SELECTED_MODE_NAME);

  const settings = getEmulatorSettings(globals[EMULATOR_PARAM]);
  const locked = EMULATOR_PARAM in (storyGlobals ?? {});

  // Parameter objects aren't referentially stable, so compare them by value
  const modesKey = JSON.stringify({ chromatic, viewport });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const modes = useMemo(() => resolveCaptureModes({ chromatic, viewport }), [modesKey]);
  const selectedMode = modes.find(({ name }) => name === selectedModeName) ?? modes[0];

  useModeGlobals(settings.viewport, selectedMode);

  return (
    <EmulatorButton
      settings={settings}
      locked={locked}
      onChange={(next: EmulatorSettings) => updateGlobals({ [EMULATOR_PARAM]: next })}
    />
  );
};
