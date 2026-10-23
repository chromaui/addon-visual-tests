import { AlertIcon } from '@storybook/icons';
import React from 'react';
import { ActionList, Form } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import type { CaptureMode } from '../emulator/modes';
import { EMULATOR_PARTS, type EmulatorPart, type EmulatorSettings } from '../emulator/settings';

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

const PART_TITLES: Record<EmulatorPart, string> = {
  viewport: 'Viewport & capture area',
  rendering: 'Capture rendering',
  identity: 'Identify as Chromatic',
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
  const descriptions: Record<EmulatorPart, string> = {
    viewport: `Resize the preview to ${formatSize(selectedMode)}, apply the mode globals and mask everything outside the captured region`,
    rendering: `Freeze animations at their ${pauseAnimationAtEnd ? 'end' : 'start'}, hide carets and spellcheck markers, no scrollbars, geometric precision text rendering`,
    identity: 'Make isChromatic() return true and set data-chromatic on the body',
  };

  return (
    <Menu>
      {!selectedMode.isDefault && (
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
      )}

      <ActionList>
        {EMULATOR_PARTS.map((part) => (
          <CheckboxItem key={part} disabled={locked}>
            <ActionList.Action as="label" ariaLabel={false} tabIndex={-1}>
              <CheckboxIcon>
                <Form.Checkbox
                  checked={settings[part]}
                  disabled={locked}
                  onChange={() => onChange({ ...settings, [part]: !settings[part] })}
                />
              </CheckboxIcon>
              <Text>
                <span>{PART_TITLES[part]}</span>
                <small>{descriptions[part]}</small>
              </Text>
            </ActionList.Action>
          </CheckboxItem>
        ))}
      </ActionList>

      <ActionList>
        {locked && (
          <ActionList.Item>
            <Text>
              <small>The Chromatic emulator is set by the story globals.</small>
            </Text>
          </ActionList.Item>
        )}
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
