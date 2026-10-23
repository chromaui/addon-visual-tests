import { ChromaticIcon } from '@storybook/icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Button, PopoverProvider } from 'storybook/internal/components';
import { useGlobals, useParameter, useStorybookState } from 'storybook/manager-api';
import { styled } from 'storybook/theming';

import { getGlobalsUpdate } from '../captureView/globals';
import {
  type CaptureMode,
  getViewportGlobal,
  resolveCaptureModes,
  type ViewportParameters,
} from '../captureView/modes';
import { type CaptureViewSettings, getCaptureViewSettings } from '../captureView/settings';
import { getUnemulatedFeatures } from '../captureView/unemulated';
import { CAPTURE_VIEW_PARAM, CAPTURE_VIEW_RESTORE_KEY, SELECTED_MODE_NAME } from '../constants';
import type { ChromaticParameters } from '../types';
import { useSharedState } from '../utils/useSharedState';
import { CaptureViewMenu, type CaptureViewMenuProps } from './CaptureViewMenu';

type Globals = Record<string, unknown>;

// Styled manually, because Button's `active` prop is deprecated and ToggleButton would imply that
// clicking toggles capture view, while it opens the settings popover.
const ToolButton = styled(Button, { shouldForwardProp: (prop) => prop !== 'enabled' })<{
  enabled: boolean;
}>(({ theme, enabled }) =>
  enabled ? { color: theme.color.secondary, background: theme.background.hoverable } : {}
);

const IconWrapper = styled.span<{ warning: boolean }>(({ theme, warning }) => ({
  position: 'relative',
  display: 'inline-flex',
  '&::after': warning
    ? {
        content: '""',
        position: 'absolute',
        top: -2,
        right: -2,
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: theme.color.warning,
        boxShadow: `0 0 0 1px ${theme.barBg}`,
      }
    : {},
}));

export const CaptureViewButton = (props: CaptureViewMenuProps) => {
  const { settings, unemulated } = props;
  return (
    <PopoverProvider
      hasChrome
      ariaLabel="Capture view settings"
      placement="bottom"
      padding={0}
      popover={<CaptureViewMenu {...props} />}
    >
      <ToolButton
        ariaLabel="Capture view"
        tooltip={
          settings.enabled
            ? 'Capture view is on: the preview matches how Chromatic captures this story. Click to configure.'
            : 'Capture view: preview this story the way Chromatic captures it, with frozen animations, hidden carets and the snapshot viewport and crop. Click to configure.'
        }
        variant="ghost"
        padding="small"
        enabled={settings.enabled}
      >
        <IconWrapper warning={settings.enabled && unemulated.length > 0}>
          <ChromaticIcon />
        </IconWrapper>
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
    const saved = JSON.parse(sessionStorage.getItem(CAPTURE_VIEW_RESTORE_KEY) || '{}');
    return mapValues(saved, (value) => (value === UNDEFINED ? undefined : value)) as Globals;
  } catch {
    return {};
  }
};

const writeSavedGlobals = (saved: Globals) => {
  if (Object.keys(saved).length) {
    const encoded = mapValues(saved, (value) => (value === undefined ? UNDEFINED : value));
    sessionStorage.setItem(CAPTURE_VIEW_RESTORE_KEY, JSON.stringify(encoded));
  } else {
    sessionStorage.removeItem(CAPTURE_VIEW_RESTORE_KEY);
  }
};

/**
 * Apply the mode globals and viewport size while capture view is active, and restore the
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

export const CaptureViewTool = () => {
  const [globals, updateGlobals, storyGlobals] = useGlobals();
  const chromatic = useParameter<ChromaticParameters['chromatic']>('chromatic', {});
  const viewport = useParameter<ViewportParameters>('viewport', {});
  const [selectedModeName, setSelectedModeName] = useSharedState<string>(SELECTED_MODE_NAME);

  const settings = getCaptureViewSettings(globals[CAPTURE_VIEW_PARAM]);
  const locked = CAPTURE_VIEW_PARAM in (storyGlobals ?? {});

  // Parameter objects aren't referentially stable, so compare them by value
  const modesKey = JSON.stringify({ chromatic, viewport });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const modes = useMemo(() => resolveCaptureModes({ chromatic, viewport }), [modesKey]);
  const selectedMode = modes.find(({ name }) => name === selectedModeName) ?? modes[0];

  useModeGlobals(settings.enabled && settings.viewport, selectedMode);

  return (
    <CaptureViewButton
      settings={settings}
      locked={locked}
      onChange={(next: CaptureViewSettings) => updateGlobals({ [CAPTURE_VIEW_PARAM]: next })}
      modes={modes}
      selectedMode={selectedMode}
      onSelectMode={setSelectedModeName}
      pauseAnimationAtEnd={chromatic?.pauseAnimationAtEnd ?? true}
      unemulated={getUnemulatedFeatures(chromatic, selectedMode.globals)}
    />
  );
};
