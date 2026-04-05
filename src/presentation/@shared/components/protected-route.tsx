"use client";

import React from 'react';
import { useAuth } from '../hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  fallback = <div>Cargando...</div>}) => {
  const { requireAuth, getAuthStatus } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    const authStatus = getAuthStatus();
    
    if (authStatus.isAuthenticated) {
      setIsAuthorized(true);
    } else {
      requireAuth(redirectTo);
      setIsAuthorized(false);
    }
    
    setIsChecking(false);
  }, [requireAuth, getAuthStatus, redirectTo]);

  if (isChecking) {
    return <>{fallback}</>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}; 