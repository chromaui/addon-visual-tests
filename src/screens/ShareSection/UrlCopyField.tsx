import { CheckIcon, CopyIcon } from '@storybook/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
// @ts-expect-error Button export exists at runtime
import { Button } from 'storybook/internal/components';
import { keyframes, styled } from 'storybook/theming';

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

const pop = keyframes({
  '0%': { transform: 'scale(0.4)', opacity: 0 },
  '50%': { transform: 'scale(1.3)' },
  '70%': { transform: 'scale(0.9)' },
  '100%': { transform: 'scale(1)', opacity: 1 },
});

const IconWrapper = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const AnimatedIcon = styled(IconWrapper)({
  animation: `${pop} 0.35s ease-out`,
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
        <CopyButton
          variant="ghost"
          size="small"
          padding="small"
          aria-label="Copy link"
          onClick={handleCopy}
        >
          {copied ? (
            <AnimatedIcon key="check">
              <CheckIcon size={14} color="green" />
            </AnimatedIcon>
          ) : (
            <IconWrapper key="copy">
              <CopyIcon size={14} />
            </IconWrapper>
          )}
        </CopyButton>
      )}
    </UrlRow>
  );
};
