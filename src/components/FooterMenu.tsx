import { ChromaticIcon, CogIcon, EllipsisIcon, QuestionIcon, UserIcon } from '@storybook/icons';
import React from 'react';
import { ActionList, PopoverProvider } from 'storybook/internal/components';
import { experimental_getStatusStore } from 'storybook/manager-api';

import { useAuthState } from '../AuthContext';
import { ADDON_ID, PROJECT_INFO } from '../constants';
import { useControlsDispatch } from '../screens/VisualTests/ControlsContext';
import { ProjectInfoPayload } from '../types';
import { useSharedState } from '../utils/useSharedState';

export const FooterMenu = () => {
  const { accessToken, setAccessToken, subdomain } = useAuthState();
  const { toggleConfig } = useControlsDispatch();
  const [projectInfo] = useSharedState<ProjectInfoPayload>(PROJECT_INFO);
  const statusStore = experimental_getStatusStore(ADDON_ID);
  const { projectId } = projectInfo || {};

  return (
    <PopoverProvider
      padding={0}
      popover={({ onHide }) => (
        <ActionList>
          <ActionList.Item>
            <ActionList.Link
              ariaLabel={false}
<<<<<<< HEAD
              href="https://www.chromatic.com/docs/visual-tests-addon/"
=======
              href="https://www.chromatic.com/docs/visual-testing-addon"
>>>>>>> 1574453 (Rework all the buttons to use new ActionList.Button component and ensure ariaLabel prop is present)
              target="_blank"
              onClick={onHide}
            >
              <ActionList.Icon>
                <QuestionIcon />
              </ActionList.Icon>
              <ActionList.Text>About this addon</ActionList.Text>
            </ActionList.Link>
          </ActionList.Item>

          <ActionList.Item>
            <ActionList.Action
              ariaLabel={false}
              onClick={() => {
                toggleConfig();
                onHide();
              }}
            >
              <ActionList.Icon>
                <CogIcon />
              </ActionList.Icon>
              <ActionList.Text>Configuration</ActionList.Text>
            </ActionList.Action>
          </ActionList.Item>

          {projectId && (
            <ActionList.Item>
              <ActionList.Link
                ariaLabel={false}
                href={`https://${subdomain}.chromatic.com/builds?appId=${projectId?.split(':')[1]}`}
                target="_blank"
                onClick={onHide}
              >
                <ActionList.Icon>
                  <ChromaticIcon />
                </ActionList.Icon>
                <ActionList.Text>View project on Chromatic</ActionList.Text>
              </ActionList.Link>
            </ActionList.Item>
          )}

          {accessToken && (
            <ActionList.Item>
              <ActionList.Action
                ariaLabel={false}
                onClick={() => {
                  statusStore.unset();
                  setAccessToken(null);
                  onHide();
                }}
              >
                <ActionList.Icon>
                  <UserIcon />
                </ActionList.Icon>
                <ActionList.Text>Log out</ActionList.Text>
              </ActionList.Action>
            </ActionList.Item>
          )}
        </ActionList>
      )}
    >
      <ActionList.Button size="small" ariaLabel="Open menu">
        <EllipsisIcon />
      </ActionList.Button>
    </PopoverProvider>
  );
};
