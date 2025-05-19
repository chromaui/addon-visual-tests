import { CogIcon, EllipsisIcon, QuestionIcon, ShareAltIcon, UserIcon } from '@storybook/icons';
import React from 'react';
import { experimental_getStatusStore } from 'storybook/manager-api';

import { useAuthState } from '../AuthContext';
import { ADDON_ID, PROJECT_INFO } from '../constants';
import { useControlsDispatch } from '../screens/VisualTests/ControlsContext';
import { ProjectInfoPayload } from '../types';
import { useSharedState } from '../utils/useSharedState';
import { TooltipMenu } from './TooltipMenu';

export const FooterMenu = () => {
  const { accessToken, setAccessToken } = useAuthState();
  const { toggleConfig } = useControlsDispatch();
  const [projectInfo] = useSharedState<ProjectInfoPayload>(PROJECT_INFO);
  const statusStore = experimental_getStatusStore(ADDON_ID);
  const { projectId } = projectInfo || {};
  const links = [
    {
      id: 'learn',
      title: 'About this addon',
      icon: <QuestionIcon aria-hidden />,
      href: 'https://www.chromatic.com/docs/visual-testing-addon',
      target: '_blank',
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: <CogIcon aria-hidden />,
      onClick: () => toggleConfig(),
    },

    ...(projectId
      ? [
          {
            id: 'visit',
            title: 'View project on Chromatic',
            icon: <ShareAltIcon aria-hidden />,
            href: projectId
              ? `https://www.chromatic.com/builds?appId=${projectId?.split(':')[1]}`
              : 'https://www.chromatic.com/start',
            target: '_blank',
          },
        ]
      : []),
    ...(accessToken
      ? [
          {
            id: 'logout',
            title: 'Log out',
            icon: <UserIcon aria-hidden />,
            onClick: () => {
              statusStore.unset();
              setAccessToken(null);
            },
          },
        ]
      : []),
  ];
  return (
    <TooltipMenu placement="top" links={links}>
      <EllipsisIcon />
    </TooltipMenu>
  );
};
