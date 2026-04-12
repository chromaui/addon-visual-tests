import { CheckIcon, CopyIcon } from '@storybook/icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// @ts-expect-error Button export exists at runtime
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

const UrlText = styled.div(({ theme }) => ({
  fontFamily: "'SF Mono', SFMono-Regular, ui-monospace, monospace",
  fontSize: 11,
  color: theme.color.secondary,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap' as const,
  flex: 1,
  paddingLeft: 9,
  lineHeight: '16px',
}));

const PlaceholderText = styled(UrlText)(({ theme }) => ({
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

  const handleCopy = useCallback(() => {
    if (url) {
      navigator.clipboard.writeText(url);
      onCopy?.();
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [url, onCopy]);

  return (
    <UrlRow>
      {url ? (
        <UrlText>{url}</UrlText>
      ) : (
        <PlaceholderText>{placeholder ?? 'Getting URL...'}</PlaceholderText>
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
    </UrlRow>
  );
};
