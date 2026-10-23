import { AlertIcon } from '@storybook/icons';
import React from 'react';
import { ActionList, Form } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import type { CaptureMode } from '../captureView/modes';
import type { CaptureViewPart, CaptureViewSettings } from '../captureView/settings';

const Menu = styled.div(({ theme }) => ({
  width: 320,
  fontSize: theme.typography.size.s2,
  color: theme.color.defaultText,
}));

const Section = styled.div(({ theme }) => ({
  padding: '10px 12px',
  '& + &': {
    borderTop: `1px solid ${theme.appBorderColor}`,
  },
}));

const Heading = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s1,
  fontWeight: theme.typography.weight.bold,
  color: theme.textMutedColor,
  marginBottom: 6,
}));

const Row = styled.label<{ disabled?: boolean }>(({ disabled }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  padding: '4px 0',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  input: { flexShrink: 0, marginTop: 2 },
}));

const Label = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});

const Title = styled.span(({ theme }) => ({
  fontWeight: theme.typography.weight.bold,
}));

const Description = styled.span(({ theme }) => ({
  fontSize: theme.typography.size.s1,
  color: theme.textMutedColor,
  lineHeight: '16px',
}));

const ModeList = styled(ActionList)({
  margin: '0 -8px',
});

const ModeLabel = styled(ActionList.Text)<{ active?: boolean }>(({ theme, active }) => ({
  color: active ? theme.color.secondary : 'inherit',
  fontWeight: active ? theme.typography.weight.bold : 'inherit',
}));

const ModeSize = styled.span(({ theme }) => ({
  marginLeft: 'auto',
  fontSize: theme.typography.size.s1,
  color: theme.textMutedColor,
}));

const Notice = styled.div(({ theme }) => ({
  display: 'flex',
  gap: 8,
  fontSize: theme.typography.size.s1,
  color: theme.textMutedColor,
  lineHeight: '16px',
  svg: { flexShrink: 0, marginTop: 1, color: theme.color.warning },
  '& + &': { marginTop: 8 },
}));

const PART_DESCRIPTIONS: Record<CaptureViewPart, { title: string; description: string }> = {
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

export interface CaptureViewMenuProps {
  settings: CaptureViewSettings;
  locked: boolean;
  onChange: (settings: CaptureViewSettings) => void;
  modes: CaptureMode[];
  selectedMode: CaptureMode;
  onSelectMode: (name: string) => void;
  pauseAnimationAtEnd: boolean;
  unemulated: string[];
}

const formatSize = ({ width, height }: CaptureMode) => `${width}×${height}`;

export const CaptureViewMenu = ({
  settings,
  locked,
  onChange,
  modes,
  selectedMode,
  onSelectMode,
  pauseAnimationAtEnd,
  unemulated,
}: CaptureViewMenuProps) => {
  const partsDisabled = locked || !settings.enabled;

  const describe = (part: CaptureViewPart) => {
    if (part === 'viewport') {
      return `Resize the preview to ${formatSize(selectedMode)} and apply the mode globals`;
    }
    if (part === 'animations') {
      return `${PART_DESCRIPTIONS[part].description}, paused at the ${pauseAnimationAtEnd ? 'end' : 'start'}`;
    }
    return PART_DESCRIPTIONS[part].description;
  };

  return (
    <Menu>
      <Section>
        <Row disabled={locked}>
          <Form.Checkbox
            checked={settings.enabled}
            disabled={locked}
            onChange={() => onChange({ ...settings, enabled: !settings.enabled })}
          />
          <Label>
            <Title>Capture view</Title>
            <Description>
              {locked
                ? 'Capture view is set by the story globals.'
                : 'Preview the story the way Chromatic captures it, so it matches the snapshot.'}
            </Description>
          </Label>
        </Row>
      </Section>

      <Section>
        <Heading>Mode</Heading>
        {modes.length > 1 ? (
          <ModeList>
            {modes.map((mode) => (
              <ActionList.Item key={mode.name}>
                <ActionList.Action
                  ariaLabel={false}
                  aria-pressed={mode.name === selectedMode.name}
                  onClick={() => onSelectMode(mode.name)}
                >
                  <ModeLabel active={mode.name === selectedMode.name}>{mode.name}</ModeLabel>
                  <ModeSize>{formatSize(mode)}</ModeSize>
                </ActionList.Action>
              </ActionList.Item>
            ))}
          </ModeList>
        ) : (
          <Description>
            {selectedMode.name} · {formatSize(selectedMode)}
          </Description>
        )}
      </Section>

      <Section>
        {(Object.keys(PART_DESCRIPTIONS) as CaptureViewPart[]).map((part) => (
          <Row key={part} disabled={partsDisabled}>
            <Form.Checkbox
              checked={settings[part]}
              disabled={partsDisabled}
              onChange={() => onChange({ ...settings, [part]: !settings[part] })}
            />
            <Label>
              <Title>{PART_DESCRIPTIONS[part].title}</Title>
              <Description>{describe(part)}</Description>
            </Label>
          </Row>
        ))}
      </Section>

      <Section>
        {unemulated.length > 0 && (
          <Notice>
            <AlertIcon />
            <span>Not emulated, because the capture browser sets it: {unemulated.join(', ')}.</span>
          </Notice>
        )}
        <Notice>
          <span>
            Code that reads the user agent before the story renders (e.g. at module load) won't see
            Chromatic's user agent. Font rendering may differ from the capture browser.
          </span>
        </Notice>
      </Section>
    </Menu>
  );
};
