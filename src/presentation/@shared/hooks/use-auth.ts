import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { axiosHelper } from '../helpers/axios-helper';
import { IntegratedAuthService, IntegratedRegisterRequest, IntegratedRegisterResponse } from '../services/integrated-auth.service';
import {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  OtpRequest,
  OtpRequestResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  RefreshTokenResponse,
} from '../types/auth';

// Query key constants
const AUTH_KEYS = {
  user: ['auth', 'user', 'currentUser'],
  validateToken: ['auth', 'validate-token'],
};

type AccountType = 'user' | 'commerce' | 'seller';

const normalizeAccountType = (value: unknown): AccountType => {
  if (typeof value !== 'string') {
    return 'user';
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'seller') {
    return 'seller';
  }

  if (normalized === 'commerce' || normalized === 'commercial' || normalized === 'store') {
    return 'commerce';
  }

  return 'user';
};

// Tipos para las respuestas del API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  correlationId: string;
  meta: {
    timestamp: string;
    version: string;
  };
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  // 🔹 Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await axiosHelper.auth.login(data);
      const apiResponse = response.data as unknown as ApiResponse<LoginResponse>;

      let accountIdFromAuth: string | undefined = (apiResponse.data as { accountId?: string }).accountId;

      if (globalThis.window !== undefined) {
        // Guardar tokens
        localStorage.setItem('accessToken', apiResponse.data.accessToken);
        localStorage.setItem('refreshToken', apiResponse.data.refreshToken);

        // Intentar extraer accountId del JWT si no vino explícito
        if (!accountIdFromAuth) {
          try {
            const token = apiResponse.data.accessToken;
            if (token) {
              const [, payload] = token.split('.');
              const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
              const decoded = JSON.parse(atob(padded)) as { accountId?: string; sub?: string };
              accountIdFromAuth = decoded?.accountId || decoded?.sub || accountIdFromAuth;
            }
          } catch {
            // ignorar
          }
        }

        // 🔹 Consultar ms-account para obtener el tipo real (commerce/seller/user)
        let accountType: AccountType = 'user'; // default
        try {
          const resp = await axiosHelper.account.getUserById(accountIdFromAuth!);
          const payload = resp.data as unknown as ApiResponse<{ id: string; accountType?: string; additionalInfo?: Record<string, unknown> }>;
          const accountUser = payload?.data ?? (resp.data as Record<string, unknown>)?.data;

          if (accountUser?.accountType) {
            accountType = normalizeAccountType(accountUser.accountType);
          } else if (accountUser?.additionalInfo && typeof (accountUser.additionalInfo as Record<string, unknown>).type === 'string') {
            accountType = normalizeAccountType((accountUser.additionalInfo as Record<string, unknown>).type);
          }
        } catch {
          // Si falla (ej. red, 401), usar accountType guardado (registro reciente como comercio)
          try {
            const existing = localStorage.getItem('user');
            const preferred = localStorage.getItem('preferredAccountType');
            if (existing) {
              const parsed = JSON.parse(existing) as { accountType?: string };
              if (parsed.accountType && (parsed.accountType === 'commerce' || parsed.accountType === 'seller')) {
                accountType = normalizeAccountType(parsed.accountType);
              }
            }
            if ((accountType === 'user') && preferred && (preferred === 'commerce' || preferred === 'seller')) {
              accountType = normalizeAccountType(preferred);
            }
          } catch {
            // ignorar
          }
        }

        // Guardar info del usuario en localStorage
        const userData = {
          id: accountIdFromAuth || 'unknown',
          email: data.email,
          name: data.email.split('@')[0],
          accountType,
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return apiResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.validateToken });
    },
    onError: (error) => {
      console.error('Login error:', error);
      if (globalThis.window !== undefined) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
  });

  // 🔹 Register mutation (directo a ms-auth)
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
      const response = await axiosHelper.auth.register(data);
      const apiResponse = response.data as unknown as ApiResponse<RegisterUserResponse>;
      return apiResponse.data;
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });

  // 🔹 Register Integrated mutation
  const registerIntegratedMutation = useMutation({
    mutationFn: async (data: IntegratedRegisterRequest): Promise<IntegratedRegisterResponse> => {
      return await IntegratedAuthService.registerIntegrated(data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas con autenticación
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.validateToken });
    },
    onError: (error) => {
      console.error('Integrated registration error:', error);
    },
  });

  // 🔹 Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await axiosHelper.auth.logout();
    },
    onSuccess: () => {
      // Limpiar tokens y datos del usuario
      if (globalThis.window !== undefined) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }

      // Invalidar todas las queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Aún así limpiar tokens en caso de error
      if (globalThis.window !== undefined) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      queryClient.clear();
    },
  });

  // 🔹 Request OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (data: OtpRequest): Promise<OtpRequestResponse> => {
      const response = await axiosHelper.auth.requestOtp(data);
      const apiResponse = response.data as unknown as ApiResponse<OtpRequestResponse>;
      return apiResponse.data;
    },
    onError: (error) => {
      console.error('Request OTP error:', error);
    },
  });

  // 🔹 Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OtpVerifyRequest): Promise<OtpVerifyResponse> => {
      const response = await axiosHelper.auth.verifyOtp(data);
      const apiResponse = response.data as unknown as ApiResponse<OtpVerifyResponse>;

      // Guardar tokens en localStorage
      if (globalThis.window !== undefined) {
        localStorage.setItem('accessToken', apiResponse.data.accessToken);
        localStorage.setItem('refreshToken', apiResponse.data.refreshToken);

        // Obtener accountId del response o fallback
        const accountIdFromAuth = (apiResponse.data as { accountId?: string }).accountId || 'unknown';
        let accountType: AccountType = 'user'; // default

        // Intentar traer el type real del ms-account
        try {
          if (accountIdFromAuth !== 'unknown') {
            const resp = await axiosHelper.account.getUserById(accountIdFromAuth);
            const accountUser = (resp.data as unknown as ApiResponse<{ id: string; accountType?: string; additionalInfo?: Record<string, unknown> }>).data;

            if (accountUser?.accountType) {
              accountType = normalizeAccountType(accountUser.accountType);
            } else if (accountUser?.additionalInfo && typeof (accountUser.additionalInfo as Record<string, unknown>).type === 'string') {
              accountType = normalizeAccountType((accountUser.additionalInfo as Record<string, unknown>).type);
            }
          }
        } catch {
          // ignorar, mantener default
        }

        // Guardar información básica del usuario en localStorage
        const userData = {
          id: accountIdFromAuth,
          email: (data as { email?: string }).email || 'usuario@ejemplo.com',
          name: ((data as { email?: string }).email || 'usuario').split('@')[0],
          accountType
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return apiResponse.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas con autenticación
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.validateToken });
    },
    onError: (error) => {
      console.error('Verify OTP error:', error);
    },
  });

  // 🔹 Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async (): Promise<RefreshTokenResponse> => {
      const refreshToken = (typeof globalThis !== 'undefined' && globalThis.window) ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        const response = await axiosHelper.auth.refreshToken(refreshToken);
        const apiResponse = response.data as unknown as ApiResponse<RefreshTokenResponse>;

        // Actualizar tokens en localStorage
        if (globalThis.window !== undefined) {
          localStorage.setItem('accessToken', apiResponse.data.accessToken);
          localStorage.setItem('refreshToken', apiResponse.data.refreshToken);
        }

        return apiResponse.data;
      }
      throw new Error('No refresh token available');
    },
    onError: (error) => {
      console.error('Refresh token error:', error);
      // Si falla el refresh, limpiar tokens
      if (globalThis.window !== undefined) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      queryClient.clear();
    },
  });

  // 🔹 Validate token query
  const validateTokenQuery = useQuery({
    queryKey: AUTH_KEYS.validateToken,
    queryFn: async () => {
      const response = await axiosHelper.auth.validateToken();
      const apiResponse = response.data as unknown as ApiResponse<{ valid: boolean }>;
      return apiResponse.data;
    },
    enabled: false, // Solo se ejecuta manualmente
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 🔹 Helper functions
  const isAuthenticated = (): boolean => {
    if (globalThis.window !== undefined) {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  };

  // Función para obtener el usuario actual
  const getCurrentUser = () => {
    if (globalThis.window !== undefined) {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          localStorage.removeItem('user'); // Limpiar dato corrupto
          return null;
        }
      }
    }
    return null;
  };

  const getAccessToken = (): string | null => {
    if (globalThis.window === undefined) return null;
    return localStorage.getItem('accessToken');
  };

  const getRefreshToken = (): string | null => {
    if (globalThis.window === undefined) return null;
    return localStorage.getItem('refreshToken');
  };

  const clearTokens = (): void => {
    if (globalThis.window !== undefined) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    queryClient.clear();
  };

  // 🔹 Navigation helper functions
  // Memoizar con useCallback para evitar loops infinitos en useEffect
  const requireAuth = useCallback((redirectTo: string = '/login'): void => {
    if (globalThis.window !== undefined && !isAuthenticated()) {
      globalThis.window.location.href = redirectTo;
    }
  }, []); // Sin dependencias - usa isAuthenticated() directamente

  const requireGuest = useCallback((redirectTo: string = '/admin/panel/home'): void => {
    if (globalThis.window !== undefined && isAuthenticated()) {
      globalThis.window.location.href = redirectTo;
    }
  }, []); // Sin dependencias - usa isAuthenticated() directamente

  const getAuthStatus = () => ({
    isAuthenticated: isAuthenticated(),
    isLoading: false,
  });

  return {
    // Mutations
    login: loginMutation,
    register: registerMutation,
    registerIntegrated: registerIntegratedMutation,
    logout: logoutMutation,
    requestOtp: requestOtpMutation,
    verifyOtp: verifyOtpMutation,
    refreshToken: refreshTokenMutation,

    // Queries
    validateToken: validateTokenQuery,

    // Helper functions
    isAuthenticated,
    getCurrentUser,
    getAccessToken,
    getRefreshToken,
    clearTokens,
    getAuthStatus,
    requireAuth,
    requireGuest,
  };
};
