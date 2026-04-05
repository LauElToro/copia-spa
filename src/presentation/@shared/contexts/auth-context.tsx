'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/use-auth';
import { UserEntity } from '../types/account';
import { RegisterUserRequest } from '../types/auth';

interface AuthContextType {
  // Estado de autenticación
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserEntity | null;

  // Funciones de autenticación
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  
  // Funciones de OTP
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (otp: string, userId: string) => Promise<void>;
  
  // Funciones de refresh
  refreshToken: () => Promise<void>;
  
  // Funciones de navegación
  requireAuth: (redirectTo?: string) => void;
  requireGuest: (redirectTo?: string) => void;
  getAuthStatus: () => { isAuthenticated: boolean; isLoading: boolean };
  
  // Estados de mutaciones
  loginMutation: Record<string, unknown>;
  registerMutation: Record<string, unknown>;
  logoutMutation: Record<string, unknown>;
  requestOtpMutation: Record<string, unknown>;
  verifyOtpMutation: Record<string, unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserEntity | null>(null);

  const {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    requestOtp: requestOtpMutation,
    verifyOtp: verifyOtpMutation,
    refreshToken: refreshTokenMutation,
    requireAuth,
    requireGuest,
    getAuthStatus,
  } = useAuth();

  // Función para verificar y actualizar el estado de autenticación
  // Usar useRef para evitar recrear la función y causar loops infinitos
  const checkAuthRef = useRef<(() => Promise<void>) | null>(null);
  
  checkAuthRef.current = useCallback(async () => {
    setIsLoading(true);

    // Leer directamente de localStorage para evitar dependencias que cambian
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
    
    if (hasToken) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setIsLoading(false);
  }, []); // Sin dependencias - lee directamente de localStorage

  // Verificar autenticación al cargar
  useEffect(() => {
    if (checkAuthRef.current) {
      void checkAuthRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // Escuchar cambios en localStorage para actualizar el estado de autenticación
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Solo reaccionar a cambios en accessToken o user
      if (e.key === 'accessToken' || e.key === 'user') {
        if (checkAuthRef.current) {
          void checkAuthRef.current();
        }
      }
    };

    // Escuchar eventos de storage (cambios desde otras pestañas)
    window.addEventListener('storage', handleStorageChange);

    // También escuchar cambios en la misma pestaña usando un evento personalizado
    const handleCustomStorageChange = () => {
      if (checkAuthRef.current) {
        void checkAuthRef.current();
      }
    };
    window.addEventListener('auth-state-change', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-change', handleCustomStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo configurar listeners una vez

  // Función de login
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      // Actualizar estado después del login
      if (checkAuthRef.current) {
        await checkAuthRef.current();
      }
      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new Event('auth-state-change'));
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  }, [loginMutation]);

  // Función de registro
  const register = useCallback(async (userData: Record<string, unknown>): Promise<void> => {
    await registerMutation.mutateAsync(userData as unknown as RegisterUserRequest);
  }, [registerMutation]);

  // Función de logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      // Actualizar estado después del logout
      if (checkAuthRef.current) {
        await checkAuthRef.current();
      }
      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new Event('auth-state-change'));
    } catch (error) {
      // Aún así limpiar el estado local
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  }, [logoutMutation]);

  // Función para solicitar OTP
  const requestOtp = useCallback(async (email: string): Promise<void> => {
    await requestOtpMutation.mutateAsync({ email });
  }, [requestOtpMutation]);

  // Función para verificar OTP
  const verifyOtp = useCallback(async (otp: string, userId: string): Promise<void> => {
    try {
      await verifyOtpMutation.mutateAsync({ otp, userId });
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  }, [verifyOtpMutation]);

  // Función para refrescar token
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      await refreshTokenMutation.mutateAsync();
      if (checkAuthRef.current) {
        await checkAuthRef.current();
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  }, [refreshTokenMutation]);

  const value = useMemo<AuthContextType>(() => ({
    // Estado
    isAuthenticated,
    isLoading,
    user,

    // Funciones
    login,
    register,
    logout,
    requestOtp,
    verifyOtp,
    refreshToken,

    // Funciones de navegación
    requireAuth,
    requireGuest,
    getAuthStatus,

    // Mutaciones (para acceder a estados como loading, error, etc.)
    loginMutation,
    registerMutation,
    logoutMutation,
    requestOtpMutation,
    verifyOtpMutation,
  }), [
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
    requestOtp,
    verifyOtp,
    refreshToken,
    requireAuth,
    requireGuest,
    getAuthStatus,
    loginMutation,
    registerMutation,
    logoutMutation,
    requestOtpMutation,
    verifyOtpMutation,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const useOptionalAuthContext = (): AuthContextType | undefined => {
  return useContext(AuthContext);
};
