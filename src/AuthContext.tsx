import React, { createContext } from 'react';

import { useRequiredContext } from './utils/useRequiredContext';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  subdomain: string;
  setSubdomain: (subdomain: string) => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthState;
}) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthState = () => useRequiredContext(AuthContext, 'AuthState');
