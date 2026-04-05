import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';
import {
  UserEntity,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
  PaginatedResponse,
  AccountApiResponse,
} from '../types/account';

// Query key constants
const ACCOUNT_KEYS = {
  users: ['account', 'users'],
  user: (id: string) => ['account', 'user', id],
  userByEmail: (email: string) => ['account', 'user', 'email', email],
  stats: ['account', 'stats'],
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

export const useAccount = () => {
  const queryClient = useQueryClient();

  // 🔹 Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserRequest): Promise<UserEntity> => {
      const response = await axiosHelper.account.createUser(data);
      const apiResponse = response.data as unknown as ApiResponse<UserEntity>;
      return apiResponse.data;
    },
    onSuccess: () => {
      // Invalidar la lista de usuarios
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.users });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.stats });
    },
    onError: (error) => {
      console.error('Create user error:', error);
    },
  });

  // 🔹 Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }): Promise<UserEntity> => {
      console.log('[useAccount] updateUserMutation - Llamando a axiosHelper.account.updateUser con:', { id, data });
      
      // Verificar que axiosHelper esté disponible
      let helper: typeof axiosHelper;
      try {
        helper = axiosHelper;
      } catch (error) {
        console.error('[useAccount] Error accediendo a axiosHelper:', error);
        throw new Error('Error accediendo a axiosHelper: ' + (error instanceof Error ? error.message : String(error)));
      }
      
      if (!helper || !helper.account || typeof helper.account.updateUser !== 'function') {
        console.error('[useAccount] axiosHelper.account.updateUser no está disponible');
        throw new Error('axiosHelper.account.updateUser no está disponible');
      }
      
      // Verificar token antes de hacer la petición
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem('accessToken');
        console.log('[useAccount] Token disponible:', { hasToken: !!token, tokenLength: token?.length || 0 });
      }
      
      const response = await helper.account.updateUser(id, data);
      console.log('[useAccount] Respuesta completa de updateUser:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });
      
      // La respuesta de ms-account viene en formato AccountApiResponse
      // Axios devuelve response.data que ya contiene el AccountApiResponse
      const apiResponse = response.data as AccountApiResponse<UserEntity>;
      console.log('[useAccount] ApiResponse parseada:', {
        success: apiResponse?.success,
        message: apiResponse?.message,
        hasData: !!apiResponse?.data,
        data: apiResponse?.data,
      });
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        console.error('[useAccount] Respuesta inválida o sin datos:', apiResponse);
        throw new Error(apiResponse?.message || 'Error al actualizar usuario: respuesta inválida');
      }
      
      return apiResponse.data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas con el usuario
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.users });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.stats });
    },
    onError: (error) => {
      console.error('Update user error:', error);
    },
  });

  // 🔹 Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await axiosHelper.account.deleteUser(id);
      const apiResponse = response.data as unknown as ApiResponse<{ message: string }>;
      return apiResponse.data;
    },
    onSuccess: (data, id) => {
      // Invalidar queries relacionadas con el usuario
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.user(id) });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.users });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.stats });
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    },
  });

  // 🔹 Get users query (paginated) - Solo se ejecuta cuando se llama explícitamente
  const getUsersQuery = useQuery({
    queryKey: ACCOUNT_KEYS.users,
    queryFn: async (): Promise<PaginatedResponse<UserEntity>> => {
      const response = await axiosHelper.account.getUsers();
      const apiResponse = response.data as unknown as ApiResponse<PaginatedResponse<UserEntity>>;
      return apiResponse.data;
    },
    enabled: false, // No ejecutar automáticamente, solo cuando se llame explícitamente
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 🔹 Get user by ID query
  const useGetUserByIdQuery = (id: string) =>
  useQuery(
    {
      queryKey: ACCOUNT_KEYS.user(id),
      queryFn: async (): Promise<UserEntity> => {
        const response = await axiosHelper.account.getUserById(id);
        const apiResponse = response.data as ApiResponse<UserEntity>;
        return apiResponse.data;
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      retry: false,
      meta: {
        onError: (error: unknown) => {
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 404) {
              console.warn('Usuario no encontrado (404), cerrando sesión automáticamente...');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              globalThis.location.href = '/';
            }
          }
        },
      },
    }
  );


  // 🔹 Get user by email query
  const useGetUserByEmailQuery = (email: string) =>
    useQuery({
      queryKey: ACCOUNT_KEYS.userByEmail(email),
      queryFn: async (): Promise<UserEntity> => {
        const response = await axiosHelper.account.getUserByEmail(email);
        const apiResponse = response.data as unknown as ApiResponse<UserEntity>;
        return apiResponse.data;
      },
      enabled: !!email,
      staleTime: 5 * 60 * 1000, // 5 minutos
    });

  // 🔹 Get user stats query - Solo se ejecuta cuando se llama explícitamente
  const getUserStatsQuery = useQuery({
    queryKey: ACCOUNT_KEYS.stats,
    queryFn: async (): Promise<UserStats> => {
      const response = await axiosHelper.account.getUserStats();
      const apiResponse = response.data as unknown as ApiResponse<UserStats>;
      return apiResponse.data;
    },
    enabled: false, // No ejecutar automáticamente, solo cuando se llame explícitamente
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 🔹 Helper functions
  const refetchUsers = () => {
    queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.users });
  };

  const refetchUser = (id: string) => {
    queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.user(id) });
  };

  const refetchUserByEmail = (email: string) => {
    queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.userByEmail(email) });
  };

  const refetchStats = () => {
    queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.stats });
  };

  return {
    // Mutations
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,

    // Queries
    getUsers: getUsersQuery,
    getUserById: useGetUserByIdQuery,
    getUserByEmail: useGetUserByEmailQuery,
    getUserStats: getUserStatsQuery,

    // Helper functions
    refetchUsers,
    refetchUser,
    refetchUserByEmail,
    refetchStats,
  };
};
