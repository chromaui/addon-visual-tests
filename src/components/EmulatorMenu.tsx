import { CheckIcon, QuestionIcon } from '@storybook/icons';
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

// The viewport part is rendered as a list of modes to choose from, rather than a checkbox
const TOGGLES = EMULATOR_PARTS.filter((part) => part !== 'viewport');

const PARTS: Record<Exclude<EmulatorPart, 'viewport'>, { title: string; description: string }> = {
  rendering: {
    title: 'Capture rendering',
    description: 'Freeze animations, hide carets and scrollbars',
  },
  identity: {
    title: 'Identify as Chromatic',
    description: 'Set user agent and body data-attribute',
  },
};

export interface EmulatorMenuProps {
  settings: EmulatorSettings;
  locked: boolean;
  onChange: (settings: EmulatorSettings) => void;
  modes: CaptureMode[];
  selectedMode: CaptureMode;
  /** Select a mode to match its viewport and capture area, or `null` to turn this off */
  onSelectViewport: (modeName: string | null) => void;
}

const formatSize = ({ width, height }: CaptureMode) => `${width}×${height}`;

export const EmulatorMenu = ({
  settings,
  locked,
  onChange,
  modes,
  selectedMode,
  onSelectViewport,
}: EmulatorMenuProps) => {
  const options = [
    { name: null, label: 'Off', size: undefined },
    ...modes.map((mode) => ({
      name: mode.name,
      label: mode.isDefault ? 'Default' : mode.name,
      size: formatSize(mode),
    })),
  ];
  const isSelected = (name: string | null) =>
    name === null ? !settings.viewport : settings.viewport && name === selectedMode.name;

  return (
    <Menu>
      <ActionList>
        <ActionList.Item>
          <Text>
            <span>Viewport & capture area</span>
            <small>Match the snapshot's viewport, mode and crop</small>
          </Text>
        </ActionList.Item>
        {options.map(({ name, label, size }) => (
          <ActionList.Item key={label} active={isSelected(name)}>
            <ActionList.Action
              ariaLabel={false}
              role="menuitemradio"
              aria-checked={isSelected(name)}
              disabled={locked}
              onClick={() => onSelectViewport(name)}
            >
              <ActionList.Icon>{isSelected(name) && <CheckIcon />}</ActionList.Icon>
              <ActionList.Text>{label}</ActionList.Text>
              {size && (
                <SizeText>
                  <small>{size}</small>
                </SizeText>
              )}
            </ActionList.Action>
          </ActionList.Item>
        ))}
      </ActionList>

      <ActionList>
        {TOGGLES.map((part) => (
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
                <span>{PARTS[part].title}</span>
                <small>{PARTS[part].description}</small>
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
        <ActionList.Item>
          <ActionList.Link
            ariaLabel={false}
            href="https://www.chromatic.com/docs/snapshots/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ActionList.Icon>
              <QuestionIcon />
            </ActionList.Icon>
            <ActionList.Text>Learn more</ActionList.Text>
          </ActionList.Link>
        </ActionList.Item>
      </ActionList>
    </Menu>
  );
};
