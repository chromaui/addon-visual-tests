import { CheckIcon } from '@storybook/icons';
import React from 'react';
import { styled } from 'storybook/theming';

const Wrapper = styled.div<{ status?: 'positive' }>(({ status, theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  border: `1px solid ${status === 'positive' ? theme.color.green : theme.appBorderColor}`,
  borderRadius: 5,
  margin: '15px 15px 0',
  minHeight: 200,
  minWidth: 200,
  maxWidth: 500,

  img: {
    display: 'block',
    maxWidth: '100%',
  },
  svg: {
    position: 'absolute',
    top: -12,
    left: -12,
    width: 24,
    height: 24,
    padding: 5,
    color: theme.color.lightest,
    borderRadius: '50%',
    backgroundColor: theme.color.green,
  },
}));

const Background = styled.div({
  width: '100%',
  margin: 2,
  background: 'white',
  borderRadius: 3,
  overflow: 'hidden',

  div: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});

interface SnapshotImageThumbProps {
  backgroundColor?: string | null;
  status?: 'positive';
  thumbnailUrl: string;
}

export const SnapshotImageThumb = ({
  backgroundColor,
  status,
  thumbnailUrl,
}: SnapshotImageThumbProps & React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <Wrapper status={status}>
      <Background>
        <div style={backgroundColor ? { backgroundColor } : {}}>
          <img alt="Snapshot thumbnail" src={thumbnailUrl} />
        </div>
      </Background>
      {status === 'positive' && <CheckIcon />}
    </Wrapper>
  );
};
