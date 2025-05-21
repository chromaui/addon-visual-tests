import React from 'react';
import { keyframes, styled } from 'storybook/theming';

import { Container } from '../../components/Container';
import { Link } from '../../components/design-system';
import { Heading } from '../../components/Heading';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { useTelemetry } from '../../utils/TelemetryContext';
import { useUninstallAddon } from '../Uninstalled/UninstallContext';

const horizontalShake = keyframes`
  0% {
    transform: translate(0, 0);
  }
  4.41177% {
    transform: translate(3px, 0);
  }
  8.82353% {
    transform: translate(0, 0);
  }
  13.23529% {
    transform: translate(3px, 0);
  }
  17.64706% {
    transform: translate(0, 0);
  }
  22.05882% {
    transform: translate(3px, 0);
  }
  26.47059% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(0, 0);
  }
`;

const Check = styled(CheckIcon)(({ theme }) => ({
  background:
    theme.base === 'dark'
      ? `color-mix(in srgb, ${theme.color.positive}, transparent 50%)`
      : theme.color.positive,
  color: 'white',
  width: 20,
  height: 20,
  padding: 4,
  borderRadius: '50%',
}));

const Step = styled(ChevronRightIcon)(({ theme }) => ({
  background: theme.background.hoverable,
  color: theme.color.secondary,
  width: 20,
  height: 20,
  padding: 4,
  borderRadius: '50%',
  animation: `${horizontalShake} 3.72s ease infinite`,
  transformOrigin: '50% 50%',
}));

export const CheckList = styled.ul({
  textAlign: 'left',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  li: {
    display: 'flex',
    gap: 10,
    padding: 10,
    lineHeight: '20px',
  },
});

const Instructions = styled.div(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  pre: {
    margin: 0,
    padding: '10px 12px',
    fontSize: '12px',
    background: theme.background.content,
    border: `1px solid ${theme.appBorderColor}`,
    borderRadius: 4,
  },
}));

export const GitError = ({ gitInfoError }: { gitInfoError?: Error }) => {
  const hasGitRepo = gitInfoError?.message.includes('one commit');
  useTelemetry('Errors', hasGitRepo ? 'GitError' : 'GitNotFound');
  const { uninstallAddon } = useUninstallAddon();
  return (
    <Screen footer={null}>
      <Container>
        <Stack>
          <div>
            <Heading>Set up a Git repository</Heading>
            <Text center muted>
              Chromatic requires Git to associate test results with commits and branches. Run these
              steps to get started:
            </Text>
          </div>
          <CheckList>
            <li>
              {hasGitRepo ? <Check /> : <Step />}
              <Instructions>
                <span>Initialize a Git repository</span>
                {!hasGitRepo && <pre>git init</pre>}
              </Instructions>
            </li>
            <li>
              <Step />
              <Instructions>
                <span>Stage all files</span>
                <pre>git add .</pre>
              </Instructions>
            </li>
            <li>
              <Step />
              <Instructions>
                <span>Commit the changes</span>
                <pre>git commit -m "Initial commit"</pre>
              </Instructions>
            </li>
          </CheckList>
          <Link
            target="_blank"
            href="https://www.chromatic.com/docs/visual-tests-addon#git-addon"
            withArrow
            secondary
          >
            Visual tests requirements
          </Link>

          <Link withArrow onClick={() => uninstallAddon()}>
            Uninstall
          </Link>
        </Stack>
      </Container>
    </Screen>
  );
};
