"use client";

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireGuest = false,
  redirectTo,
  fallback = null}) => {
  const { requireAuth: requireAuthFn, requireGuest: requireGuestFn, getAuthStatus } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = getAuthStatus();
      
      if (requireAuth) {
        // Ruta que requiere autenticación
        if (authStatus.isAuthenticated) {
          setIsAuthorized(true);
        } else {
          requireAuthFn(redirectTo || '/login');
          setIsAuthorized(false);
        }
      } else if (requireGuest) {
        // Ruta solo para usuarios NO logueados
        if (authStatus.isAuthenticated) {
          requireGuestFn(redirectTo || '/admin/panel/home');
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } else {
        // Sin restricciones
        setIsAuthorized(true);
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [requireAuth, requireGuest, redirectTo, requireAuthFn, requireGuestFn, getAuthStatus]);

  if (isChecking) {
    return fallback;
  }

  if (!isAuthorized) {
    return null; // No renderizar nada si no está autorizado
  }

  return <>{children}</>;
}; 