import { useEffect } from 'react';
import { useAccount } from './use-account';

interface QueryResult<T> {
  data: T | null;
  isError: boolean;
  isLoading: boolean;
  error: unknown;
  refetch?: () => void;
}

/**
 * Hook para obtener el perfil del usuario actual
 * Usa el JWT del localStorage para obtener el accountId y luego llama al hook de account
 */
export const useProfile = () => {
  // Obtener el accountId del JWT almacenado
  const getAccountIdFromToken = (): string | null => {
        if (globalThis.window === undefined) return null;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      // Decodificar el JWT para obtener el accountId
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      const parsedPayload = JSON.parse(decodedPayload);
      
      return parsedPayload.accountId || parsedPayload.sub || null;
    } catch (error) {
      console.error('Error decoding JWT for accountId:', error);
      return null;
    }
  };

  const accountId = getAccountIdFromToken();
  const accountHooks = useAccount() as { getUserById: (id: string) => QueryResult<unknown> };

  // Query por ID (JWT)
  const profileById = accountHooks.getUserById(accountId || '');

  // Fallback: Query por email deshabilitado temporalmente
  const profileByEmail = { data: null, isError: false, isLoading: false, error: null };

  // Efecto: si ID devuelve 404 pero por email encontramos el usuario, actualizar localStorage y evitar logout
  useEffect(() => {
    const errorResponse = profileById.error as { response?: { status?: number } } | null;
    const notFoundById = profileById.isError && errorResponse?.response?.status === 404;
    const foundByEmail = !!profileByEmail?.data;

    if (notFoundById && foundByEmail && profileByEmail.data) {
      // Actualizar localStorage.user con el ID correcto y mantener sesión
      try {
        const userStr = localStorage.getItem('user');
        const userObj = userStr ? JSON.parse(userStr) as { id?: string } : {};
        userObj.id = (profileByEmail.data as { id: string }).id;
        localStorage.setItem('user', JSON.stringify(userObj));
      } catch {
        // ignorar
      }
    }
  }, [profileById.isError, profileById.error, profileByEmail.data]);

  return {
    profile: profileById.data || profileByEmail.data,
    isLoading: profileById.isLoading || profileByEmail.isLoading,
    isError: profileById.isError && profileByEmail.isError,
    error: profileById.error || profileByEmail.error,
    refetch: profileById.refetch,
    isAuthenticated: !!accountId && !!localStorage.getItem('accessToken'),
  };
};
