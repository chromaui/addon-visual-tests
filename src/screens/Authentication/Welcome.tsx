import { ChevronDownIcon } from '@storybook/icons';
import React from 'react';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';
import { Container as BaseContainer } from '../../components/Container';
import { Link } from '../../components/design-system';
import { Heading as BaseHeading } from '../../components/Heading';
import { ChromeIcon } from '../../components/icons/ChromeIcon';
import { FirefoxIcon } from '../../components/icons/FirefoxIcon';
import { SafariIcon } from '../../components/icons/SafariIcon';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';

interface WelcomeProps {
  onNext: () => void;
  onUninstall: () => void;
}

const Heading = styled(BaseHeading)(({ theme }) => ({
  fontSize: theme.typography.size.s3,
  '@container (min-width: 800px)': {
    fontSize: theme.typography.size.m1,
  },
}));

const Container = styled(BaseContainer)({
  padding: '30px 30px 0 30px',
  gap: 30,
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  '@container (min-width: 800px)': {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
  },
});

const Footer = styled.div({
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
});

const ButtonRow = styled.div({
  display: 'flex',
  gap: 8,
});

const CTA = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const VideoContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 400,
  overflow: 'hidden',
  backgroundColor: 'white',
  outline: `1px solid ${theme.appBorderColor}`,
  borderRadius: 8,
  video: {
    margin: 4,
    width: 'calc(100% - 8px)',
    aspectRatio: '400/220',
  },
}));

const Info = styled.div({
  display: 'flex',
  flexDirection: 'row',
  gap: 8,
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: `1px solid rgba(38, 85, 115, 0.15)`,
  padding: '8px 15px 8px 10px',
  color: '#5C6870',
  fontSize: '13px',
  pointerEvents: 'none',
  '& > div': {
    display: 'flex',
    gap: 8,
  },
  span: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '0 5px',
  },
});

export const Welcome = ({ onNext, onUninstall }: WelcomeProps) => {
  return (
    <Screen footer={null} ignoreConfig interstitial>
      <Container>
        <Stack alignItems="start" textAlign="left">
          <div>
            <Heading>Visual tests in Storybook</Heading>
            <Text muted>
              Pinpoint visual bugs across browsers, viewports, and themes using Chromatic.
            </Text>
          </div>
          <CTA>
            <ButtonRow>
              <Button variant="solid" size="medium" onClick={onNext}>
                Get started for free
              </Button>
              <Button asChild variant="outline" size="medium">
                <a href="https://www.chromatic.com/storybook" target="_blank">
                  See all the features
                </a>
              </Button>
            </ButtonRow>
            <Text muted small>
              No credit card required
            </Text>
          </CTA>
        </Stack>
        <VideoContainer>
          <video autoPlay muted loop>
            <source
              src="./addon-visual-tests-assets/visual-test-illustration.mp4"
              type="video/mp4"
            />
          </video>
          <Info aria-hidden>
            <span>Testing 97/248 stories...</span>
            <div>
              <span>
                Dark mode
                <ChevronDownIcon size={10} />
              </span>
              <ChromeIcon alt="" />
              <SafariIcon alt="" />
              <FirefoxIcon alt="" />
            </div>
          </Info>
        </VideoContainer>
      </Container>
      <Footer>
        <Text muted>Not interested?</Text>
        <Link onClick={() => onUninstall()}>Uninstall this addon</Link>
      </Footer>
    </Screen>
  );
};
