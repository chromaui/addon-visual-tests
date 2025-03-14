import React, { useCallback, useEffect } from 'react';
import type { API_FilterFunction } from 'storybook/internal/types';
import { type API, type State, useStorybookState } from 'storybook/manager-api';
import { styled } from 'storybook/theming';

import { ADDON_ID, ENABLE_FILTER } from '../constants';
import { SidebarToggleButton } from './SidebarToggleButton';

const filterNone: API_FilterFunction = () => true;
const filterWarn: API_FilterFunction = ({ status }) => status?.[ADDON_ID]?.status === 'warn';
const filterError: API_FilterFunction = ({ status }) => status?.[ADDON_ID]?.status === 'error';
const filterBoth: API_FilterFunction = ({ status }) =>
  status?.[ADDON_ID]?.status === 'warn' || status?.[ADDON_ID]?.status === 'error';

const getFilter = (showWarnings = false, showErrors = false) => {
  if (showWarnings && showErrors) return filterBoth;
  if (showWarnings) return filterWarn;
  if (showErrors) return filterError;
  return filterNone;
};

const Wrapper = styled.div({
  display: 'flex',
  gap: 5,
});

interface SidebarBottomProps {
  api: API;
  status: State['status'];
}

export const SidebarBottomBase = ({ api, status }: SidebarBottomProps) => {
  const [showWarnings, setShowWarnings] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);

  const warnings = Object.values(status).filter((value) => value[ADDON_ID]?.status === 'warn');
  const errors = Object.values(status).filter((value) => value[ADDON_ID]?.status === 'error');
  const hasWarnings = warnings.length > 0;
  const hasErrors = errors.length > 0;

  const toggleWarnings = useCallback(() => setShowWarnings((shown) => !shown), []);
  const toggleErrors = useCallback(() => setShowErrors((shown) => !shown), []);

  useEffect(() => {
    const filter = getFilter(hasWarnings && showWarnings, hasErrors && showErrors);
    api.experimental_setFilter(ADDON_ID, filter);
    api.emit(ENABLE_FILTER, filter);
  }, [api, hasWarnings, hasErrors, showWarnings, showErrors]);

  if (!hasWarnings && !hasErrors) return null;

  return (
    <Wrapper id="sidebar-bottom-wrapper">
      {hasWarnings && (
        <SidebarToggleButton
          id="warnings-found-filter"
          active={showWarnings}
          count={warnings.length}
          label="Change"
          status="warning"
          onClick={toggleWarnings}
        />
      )}
      {hasErrors && (
        <SidebarToggleButton
          id="errors-found-filter"
          active={showErrors}
          count={errors.length}
          label="Error"
          status="critical"
          onClick={toggleErrors}
        />
      )}
    </Wrapper>
  );
};

export const SidebarBottom = (props: Omit<SidebarBottomProps, 'status'>) => {
  const { status } = useStorybookState();
  return <SidebarBottomBase {...props} status={status} />;
};
