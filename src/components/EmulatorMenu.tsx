import { QuestionIcon } from '@storybook/icons';
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

const PARTS: Record<EmulatorPart, { title: string; description: string }> = {
  viewport: {
    title: 'Viewport & capture area',
    description: "Match the snapshot's viewport, mode and crop",
  },
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
  onSelectMode: (name: string) => void;
}

const formatSize = ({ width, height }: CaptureMode) => `${width}×${height}`;

export const EmulatorMenu = ({
  settings,
  locked,
  onChange,
  modes,
  selectedMode,
  onSelectMode,
}: EmulatorMenuProps) => {
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
