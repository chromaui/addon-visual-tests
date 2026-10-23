import { AlertIcon } from '@storybook/icons';
import React from 'react';
import { ActionList, Form } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import type { CaptureMode } from '../emulator/modes';
import type { EmulatorPart, EmulatorSettings } from '../emulator/settings';

const Menu = styled.div({
  width: 320,
});

// ActionList.Text truncates its <span> children, but these titles and descriptions should wrap
const Text = styled(ActionList.Text)({
  '& > span': { whiteSpace: 'normal' },
});

const CheckboxItem = styled(ActionList.Item)<{ disabled?: boolean }>(({ disabled }) => ({
  opacity: disabled ? 0.5 : 1,
  label: { cursor: disabled ? 'not-allowed' : 'pointer' },
}));

// Align the checkbox with the title rather than centering it on the title and description
const CheckboxIcon = styled(ActionList.Icon)({
  alignSelf: 'flex-start',
  marginTop: 9,
});

const SizeText = styled(ActionList.Text)({
  flexGrow: 0,
});

const Heading = styled(ActionList.Text)(({ theme }) => ({
  fontWeight: theme.typography.weight.bold,
  color: theme.textMutedColor,
}));

const WarningIcon = styled(ActionList.Icon)(({ theme }) => ({
  color: theme.color.warning,
  alignSelf: 'flex-start',
  marginTop: 9,
  marginLeft: 8,
}));

const PART_DESCRIPTIONS: Record<EmulatorPart, { title: string; description: string }> = {
  viewport: {
    title: 'Viewport & mode globals',
    description: 'Resize the preview to the snapshot viewport and apply the mode globals',
  },
  animations: {
    title: 'Freeze animations',
    description: 'Restart and pause CSS and SVG animations, reset videos',
  },
  carets: {
    title: 'Hide carets & spellcheck',
    description: 'Hide the text cursor and spelling or grammar markers',
  },
  rendering: {
    title: 'Capture rendering',
    description: 'Geometric precision text rendering, no scrollbars, eager image loading',
  },
  identity: {
    title: 'Identify as Chromatic',
    description: 'Make isChromatic() return true and set data-chromatic on the body',
  },
  mask: {
    title: 'Mask outside capture area',
    description: 'Dim everything that falls outside the captured region',
  },
};

export interface EmulatorMenuProps {
  settings: EmulatorSettings;
  locked: boolean;
  onChange: (settings: EmulatorSettings) => void;
  modes: CaptureMode[];
  selectedMode: CaptureMode;
  onSelectMode: (name: string) => void;
  pauseAnimationAtEnd: boolean;
  unemulated: string[];
}

const formatSize = ({ width, height }: CaptureMode) => `${width}×${height}`;

export const EmulatorMenu = ({
  settings,
  locked,
  onChange,
  modes,
  selectedMode,
  onSelectMode,
  pauseAnimationAtEnd,
  unemulated,
}: EmulatorMenuProps) => {
  const partsDisabled = locked || !settings.enabled;

  const describe = (part: EmulatorPart) => {
    if (part === 'viewport') {
      return `Resize the preview to ${formatSize(selectedMode)} and apply the mode globals`;
    }
    if (part === 'animations') {
      return `${PART_DESCRIPTIONS[part].description}, paused at the ${pauseAnimationAtEnd ? 'end' : 'start'}`;
    }
    return PART_DESCRIPTIONS[part].description;
  };

  const checkbox = ({
    key,
    title,
    description,
    checked,
    disabled,
    onToggle,
  }: {
    key: string;
    title: string;
    description: string;
    checked: boolean;
    disabled: boolean;
    onToggle: () => void;
  }) => (
    <CheckboxItem key={key} disabled={disabled}>
      <ActionList.Action as="label" ariaLabel={false} tabIndex={-1}>
        <CheckboxIcon>
          <Form.Checkbox checked={checked} disabled={disabled} onChange={onToggle} />
        </CheckboxIcon>
        <Text>
          <span>{title}</span>
          <small>{description}</small>
        </Text>
      </ActionList.Action>
    </CheckboxItem>
  );

  return (
    <Menu>
      <ActionList>
        {checkbox({
          key: 'enabled',
          title: 'Chromatic emulator',
          description: locked
            ? 'Chromatic emulator is set by the story globals.'
            : 'Preview the story the way Chromatic captures it, so it matches the snapshot.',
          checked: settings.enabled,
          disabled: locked,
          onToggle: () => onChange({ ...settings, enabled: !settings.enabled }),
        })}
      </ActionList>

      <ActionList>
        <ActionList.Item>
          <Heading>Mode</Heading>
        </ActionList.Item>
        {modes.length > 1 ? (
          modes.map((mode) => (
            <ActionList.Item key={mode.name} active={mode.name === selectedMode.name}>
              <ActionList.Action
                ariaLabel={false}
                aria-pressed={mode.name === selectedMode.name}
                onClick={() => onSelectMode(mode.name)}
              >
                <ActionList.Text>{mode.name}</ActionList.Text>
                <SizeText>
                  <small>{formatSize(mode)}</small>
                </SizeText>
              </ActionList.Action>
            </ActionList.Item>
          ))
        ) : (
          <ActionList.Item>
            <ActionList.Text>{selectedMode.name}</ActionList.Text>
            <SizeText>
              <small>{formatSize(selectedMode)}</small>
            </SizeText>
          </ActionList.Item>
        )}
      </ActionList>

      <ActionList>
        {(Object.keys(PART_DESCRIPTIONS) as EmulatorPart[]).map((part) =>
          checkbox({
            key: part,
            title: PART_DESCRIPTIONS[part].title,
            description: describe(part),
            checked: settings[part],
            disabled: partsDisabled,
            onToggle: () => onChange({ ...settings, [part]: !settings[part] }),
          })
        )}
      </ActionList>

      <ActionList>
        {unemulated.length > 0 && (
          <ActionList.Item>
            <WarningIcon>
              <AlertIcon />
            </WarningIcon>
            <Text>
              <small>
                Not emulated, because the capture browser sets it: {unemulated.join(', ')}.
              </small>
            </Text>
          </ActionList.Item>
        )}
        <ActionList.Item>
          <Text>
            <small>
              Code that reads the user agent before the story renders (e.g. at module load) won't
              see Chromatic's user agent. Font rendering may differ from the capture browser.
            </small>
          </Text>
        </ActionList.Item>
      </ActionList>
    </Menu>
  );
};
