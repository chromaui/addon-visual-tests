import { CheckIcon, CopyIcon } from '@storybook/icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, TooltipNote, TooltipProvider } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

const UrlRow = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  border: `1px solid ${theme.appBorderColor}`,
  borderRadius: 4,
  minHeight: 32,
}));

const UrlInput = styled.input(({ theme }) => ({
  fontFamily: "'SF Mono', SFMono-Regular, ui-monospace, monospace",
  fontSize: 11,
  color: theme.color.secondary,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap' as const,
  flex: 1,
  paddingLeft: 9,
  lineHeight: '16px',
  border: 'none',
  background: 'transparent',
  outline: 'none',
  cursor: 'default',
  width: 0,
}));

const SrOnly = styled.span({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
});

const PlaceholderText = styled(UrlInput)(({ theme }) => ({
  color: theme.textMutedColor,
}));

const CopyButton = styled(Button)({
  margin: 1,
});

interface UrlCopyFieldProps {
  url?: string;
  placeholder?: string;
  onCopy?: () => void;
}

export const UrlCopyField = ({ url, placeholder, onCopy }: UrlCopyFieldProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      onCopy?.();
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  }, [url, onCopy]);

  return (
    <UrlRow>
      {url ? (
        <UrlInput
          readOnly
          value={url}
          aria-label="Shareable URL"
          onFocus={(e) => e.target.select()}
        />
      ) : (
        <PlaceholderText
          readOnly
          value={placeholder ?? 'Getting URL...'}
          aria-label="Shareable URL"
          tabIndex={-1}
        />
      )}
      {url && (
        <TooltipProvider
          tooltip={<TooltipNote note={copied ? 'Copied!' : 'Copy link to clipboard'} />}
          placement="top"
          visible={copied || undefined}
        >
          <CopyButton
            variant="ghost"
            size="small"
            padding="small"
            aria-label="Copy link"
            onClick={handleCopy}
          >
            {copied ? <CheckIcon color="green" /> : <CopyIcon />}
          </CopyButton>
        </TooltipProvider>
      )}
      <SrOnly aria-live="polite">{copied ? 'Copied to clipboard' : ''}</SrOnly>
    </UrlRow>
  );
};
